import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { backupData, options = {} } = body

    if (!backupData || !backupData.data) {
      return NextResponse.json(
        { error: 'Invalid backup data format' },
        { status: 400 }
      )
    }

    console.log(`Database restore initiated by admin: ${admin.email}`)
    console.log(`Backup metadata:`, backupData.metadata)

    const { data } = backupData
    const { clearExisting = false, skipPasswords = true } = options

    // Start transaction
    const result = await prisma.$transaction(async (tx: any) => {
      const restored = {
        users: 0,
        properties: 0,
        locations: 0,
        blogPosts: 0,
        contactSubmissions: 0,
        emailSubscribers: 0,
        userActivities: 0,
        siteSettings: 0
      }

      // Clear existing data if requested
      if (clearExisting) {
        console.log('🗑️ Clearing existing data...')
        await Promise.all([
          tx.userActivity.deleteMany(),
          tx.contactSubmission.deleteMany(),
          tx.emailSubscriber.deleteMany(),
          tx.blogPost.deleteMany(),
          tx.property.deleteMany(),
          tx.location.deleteMany(),
          tx.siteSettings.deleteMany(),
          // Don't delete users to preserve admin access
        ])
      }

      // Restore locations first (referenced by properties)
      if (data.locations && data.locations.length > 0) {
        for (const location of data.locations) {
          try {
            await tx.location.upsert({
              where: { id: location.id },
              update: {
                name: location.name,
                slug: location.slug,
                description: location.description,
                image: location.image,
                coordinates: location.coordinates,
                highlights: location.highlights,
                amenities: location.amenities,
                featured: location.featured,
                propertyCount: location.propertyCount,
                active: location.active
              },
              create: {
                id: location.id,
                name: location.name,
                slug: location.slug,
                description: location.description,
                image: location.image,
                coordinates: location.coordinates,
                highlights: location.highlights,
                amenities: location.amenities,
                featured: location.featured,
                propertyCount: location.propertyCount,
                active: location.active
              }
            })
            restored.locations++
          } catch (error) {
            console.warn(`Failed to restore location ${location.id}:`, error)
          }
        }
      }

      // Restore properties
      if (data.properties && data.properties.length > 0) {
        for (const property of data.properties) {
          try {
            const { location, ...propertyData } = property
            await tx.property.upsert({
              where: { id: property.id },
              update: propertyData,
              create: propertyData
            })
            restored.properties++
          } catch (error) {
            console.warn(`Failed to restore property ${property.id}:`, error)
          }
        }
      }

      // Restore users (excluding passwords if skipPasswords is true)
      if (data.users && data.users.length > 0) {
        for (const user of data.users) {
          try {
            const userData = { ...user }
            
            // Skip password restoration if requested or if password is redacted
            if (skipPasswords || user.password === '[REDACTED]') {
              delete userData.password
            } else if (user.password) {
              // Hash the password if it's not already hashed
              if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
                userData.password = await bcrypt.hash(user.password, 12)
              }
            }

            await tx.user.upsert({
              where: { id: user.id },
              update: userData,
              create: userData
            })
            restored.users++
          } catch (error) {
            console.warn(`Failed to restore user ${user.id}:`, error)
          }
        }
      }

      // Restore blog posts
      if (data.blogPosts && data.blogPosts.length > 0) {
        for (const post of data.blogPosts) {
          try {
            await tx.blogPost.upsert({
              where: { id: post.id },
              update: post,
              create: post
            })
            restored.blogPosts++
          } catch (error) {
            console.warn(`Failed to restore blog post ${post.id}:`, error)
          }
        }
      }

      // Restore contact submissions
      if (data.contactSubmissions && data.contactSubmissions.length > 0) {
        for (const submission of data.contactSubmissions) {
          try {
            await tx.contactSubmission.upsert({
              where: { id: submission.id },
              update: submission,
              create: submission
            })
            restored.contactSubmissions++
          } catch (error) {
            console.warn(`Failed to restore contact submission ${submission.id}:`, error)
          }
        }
      }

      // Restore email subscribers
      if (data.emailSubscribers && data.emailSubscribers.length > 0) {
        for (const subscriber of data.emailSubscribers) {
          try {
            await tx.emailSubscriber.upsert({
              where: { id: subscriber.id },
              update: subscriber,
              create: subscriber
            })
            restored.emailSubscribers++
          } catch (error) {
            console.warn(`Failed to restore email subscriber ${subscriber.id}:`, error)
          }
        }
      }

      // Restore user activities
      if (data.userActivities && data.userActivities.length > 0) {
        for (const activity of data.userActivities) {
          try {
            await tx.userActivity.upsert({
              where: { id: activity.id },
              update: activity,
              create: activity
            })
            restored.userActivities++
          } catch (error) {
            console.warn(`Failed to restore user activity ${activity.id}:`, error)
          }
        }
      }

      // Restore site settings
      if (data.siteSettings && data.siteSettings.length > 0) {
        for (const setting of data.siteSettings) {
          try {
            await tx.siteSettings.upsert({
              where: { id: setting.id },
              update: setting,
              create: setting
            })
            restored.siteSettings++
          } catch (error) {
            console.warn(`Failed to restore site setting ${setting.id}:`, error)
          }
        }
      }

      return restored
    })

    console.log(`✅ Database restore completed successfully:`, result)

    return NextResponse.json({
      success: true,
      message: 'Database restored successfully',
      restored: result,
      metadata: backupData.metadata
    })

  } catch (error) {
    console.error('Database restore error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to restore database',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 