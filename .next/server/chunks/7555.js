exports.id=7555,exports.ids=[7555],exports.modules={5069:(e,t,a)=>{"use strict";a.d(t,{zR:()=>o});var i=a(38824);let o=globalThis.prisma??new i.PrismaClient},5502:(e,t,a)=>{"use strict";a.d(t,{Bm:()=>n,Hy:()=>l,RA:()=>d});var i=a(5069);let o={siteName:"Avacasa",siteDescription:"Premium Real Estate Platform for Holiday Homes and Investment Properties",siteUrl:"https://avacasa.life",contactEmail:"contact@avacasa.life",contactPhone:"+91 9876543210",address:"Mumbai, Maharashtra, India",metaTitle:"Avacasa - Premium Real Estate Platform",metaDescription:"Discover premium holiday homes, farmlands, and investment properties. Your trusted partner in real estate investment.",metaKeywords:"real estate, holiday homes, farmland, investment properties, Mumbai, Maharashtra",ogImage:"/images/og-image.jpg",emailFrom:"noreply@avacasa.life",emailHost:"smtp.gmail.com",emailPort:"587",emailPassword:"",adminEmail:"admin@avacasa.life",googleAnalyticsId:"",facebookPixelId:"",trackingEnabled:!0,maintenanceMode:!1,allowRegistration:!0,requireEmailVerification:!0,maxLoginAttempts:5,sessionTimeout:24,featuredPropertiesLimit:6,blogPostsPerPage:9,enableComments:!0,moderateComments:!0,emailNotifications:!0,smsNotifications:!1,pushNotifications:!1,primaryColor:"#1f2937",secondaryColor:"#3b82f6",logoUrl:"/images/logo.png",faviconUrl:"/favicon.ico",facebookUrl:"",twitterUrl:"",instagramUrl:"",linkedinUrl:"",youtubeUrl:""},s=null,r=0;async function n(){try{let e=Date.now();if(s&&e-r<3e5)return s;let t=await i.zR.siteSettings.findUnique({where:{id:"settings"}}),a=o;if(t)try{let e=JSON.parse(t.data);a={...o,...e}}catch(e){console.error("Failed to parse settings data:",e)}return s=a,r=e,a}catch(e){return console.error("Failed to get site settings:",e),o}}function l(){s=null,r=0}async function d(){let e=await n();return{featuredPropertiesLimit:e.featuredPropertiesLimit,blogPostsPerPage:e.blogPostsPerPage,enableComments:e.enableComments,moderateComments:e.moderateComments}}},21111:(e,t,a)=>{"use strict";a.d(t,{$_:()=>m,MT:()=>c});var i=a(49526),o=a(5502);let s=()=>!!(process.env.MAIL_FROM&&process.env.MAIL_APP_PASSWORD),r={host:process.env.MAIL_HOST||"smtp.gmail.com",port:parseInt(process.env.MAIL_PORT||"587"),secure:!1,auth:{user:process.env.MAIL_FROM,pass:process.env.MAIL_APP_PASSWORD}},n=null;s()?n=i.createTransport(r):console.warn("⚠️  Email not configured. Set MAIL_FROM and MAIL_APP_PASSWORD environment variables.");let l={contactFormNotification:e=>({subject:`New Contact Form Submission: ${e.subject}`,html:`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #1f2937 0%, #374151 100%); color: white; padding: 30px; text-align: center; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .header-subtitle { font-size: 16px; opacity: 0.9; }
            .content { padding: 30px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
            .info-item { background-color: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; }
            .info-label { font-weight: bold; color: #374151; margin-bottom: 5px; }
            .info-value { color: #1f2937; }
            .message-box { background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🏡 Avacasa</div>
              <div class="header-subtitle">New Contact Form Submission</div>
            </div>
            
            <div class="content">
              <h2 style="color: #1f2937; margin-top: 0;">Contact Form Details</h2>
              
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Name</div>
                  <div class="info-value">${e.name}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Email</div>
                  <div class="info-value">${e.email}</div>
                </div>
                ${e.phone?`
                <div class="info-item">
                  <div class="info-label">Phone</div>
                  <div class="info-value">${e.phone}</div>
                </div>
                `:""}
                <div class="info-item">
                  <div class="info-label">Subject</div>
                  <div class="info-value">${e.subject}</div>
                </div>
                ${e.propertyInterest?`
                <div class="info-item">
                  <div class="info-label">Property Interest</div>
                  <div class="info-value">${e.propertyInterest}</div>
                </div>
                `:""}
                <div class="info-item">
                  <div class="info-label">Submitted At</div>
                  <div class="info-value">${e.submittedAt}</div>
                </div>
              </div>
              
              <div class="message-box">
                <h3 style="color: #1f2937; margin-top: 0;">Message</h3>
                <p style="color: #374151; line-height: 1.6; margin: 0;">${e.message}</p>
              </div>
            </div>
            
            <div class="footer">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                This email was sent from the Avacasa contact form.<br>
                Please respond to the customer directly at ${e.email}
              </p>
            </div>
          </div>
        </body>
      </html>
    `,text:`
New Contact Form Submission

Name: ${e.name}
Email: ${e.email}
${e.phone?`Phone: ${e.phone}`:""}
Subject: ${e.subject}
${e.propertyInterest?`Property Interest: ${e.propertyInterest}`:""}
Submitted At: ${e.submittedAt}

Message:
${e.message}

Please respond to the customer directly at ${e.email}
    `}),contactFormAutoReply:async e=>{let t=await (0,o.Bm)();return{subject:`Thank you for contacting ${t.siteName}!`,html:`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Thank you for contacting ${t.siteName}</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
              .header { background: linear-gradient(135deg, #1f2937 0%, #374151 100%); color: white; padding: 30px; text-align: center; }
              .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
              .header-subtitle { font-size: 16px; opacity: 0.9; }
              .content { padding: 30px; }
              .highlight-box { background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; }
              .steps { background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; }
              .step { display: flex; align-items: flex-start; margin-bottom: 15px; }
              .step-number { background-color: #3b82f6; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; margin-right: 15px; flex-shrink: 0; }
              .step-content { flex: 1; }
              .contact-info { background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 20px 0; }
              .btn { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 5px; }
              .footer { background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">🏡 ${t.siteName}</div>
                <div class="header-subtitle">Holiday Homes & Vacation Real Estate</div>
              </div>
              
              <div class="content">
                <h2 style="color: #1f2937; margin-top: 0;">Thank you, ${e.name}!</h2>
                
                <div class="highlight-box">
                  <h3 style="color: #1e40af; margin-top: 0;">We've received your inquiry!</h3>
                  <p style="color: #1e3a8a; margin-bottom: 0; font-size: 16px;">
                    Our property experts are reviewing your message about "<strong>${e.subject}</strong>" and will get back to you soon.
                  </p>
                </div>
                
                <div class="steps">
                  <h3 style="color: #1f2937; margin-top: 0;">What happens next?</h3>
                  <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                      <strong>Review & Analysis</strong><br>
                      <span style="color: #6b7280;">Our property experts will review your inquiry within 24 hours</span>
                    </div>
                  </div>
                  <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                      <strong>Personalized Recommendations</strong><br>
                      <span style="color: #6b7280;">We'll prepare customized property options based on your requirements</span>
                    </div>
                  </div>
                  <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                      <strong>Detailed Response</strong><br>
                      <span style="color: #6b7280;">You'll receive a comprehensive response with property options and next steps</span>
                    </div>
                  </div>
                </div>
                
                <div class="contact-info">
                  <h3 style="color: #1f2937; margin-top: 0;">Need immediate assistance?</h3>
                  <p style="color: #374151; margin-bottom: 10px;">
                    ${t.contactPhone?`📞 <strong>Call us:</strong> ${t.contactPhone}<br>`:""}
                    ${t.contactEmail?`📧 <strong>Email:</strong> ${t.contactEmail}<br>`:""}
                    🕒 <strong>Hours:</strong> Monday - Saturday, 9 AM - 7 PM IST
                  </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${t.siteUrl}/properties" class="btn">Browse Properties</a>
                  <a href="${t.siteUrl}/locations" class="btn">Explore Locations</a>
                </div>
              </div>
              
              <div class="footer">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  Best regards,<br>
                  <strong>The ${t.siteName} Team</strong><br>
                  Your trusted partner in vacation real estate
                </p>
              </div>
            </div>
          </body>
        </html>
      `,text:`
Thank you for contacting ${t.siteName}, ${e.name}!

We've received your inquiry about "${e.subject}" and our team will review it shortly.

What happens next?
- Our property experts will review your inquiry within 24 hours
- We'll prepare personalized recommendations based on your requirements  
- You'll receive a detailed response with property options and next steps

Need immediate assistance?
${t.contactPhone?`Call us: ${t.contactPhone}`:""}
${t.contactEmail?`Email: ${t.contactEmail}`:""}
Hours: Monday - Saturday, 9 AM - 7 PM IST

Best regards,
The ${t.siteName} Team
Your trusted partner in vacation real estate
      `}},customNotification:e=>({subject:e.subject,html:`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${e.subject}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #1f2937 0%, #374151 100%); color: white; padding: 30px; text-align: center; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .header-subtitle { font-size: 16px; opacity: 0.9; }
            .content { padding: 30px; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🏡 Avacasa</div>
              <div class="header-subtitle">Holiday Homes & Vacation Real Estate</div>
            </div>
            
            <div class="content">
              ${e.recipientName?`<p>Dear ${e.recipientName},</p>`:""}
              ${e.content}
            </div>
            
            <div class="footer">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Best regards,<br>
                <strong>The Avacasa Team</strong>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,text:e.content.replace(/<[^>]*>/g,"")})},d=async e=>{if(!s()||!n)return console.warn("⚠️  Email not configured. Skipping email send."),{success:!1,error:"Email not configured. Please set MAIL_FROM and MAIL_APP_PASSWORD environment variables."};try{let t={from:e.from||`"Avacasa" <${process.env.MAIL_FROM}>`,to:Array.isArray(e.to)?e.to.join(", "):e.to,subject:e.subject,html:e.html,text:e.text},a=await n.sendMail(t);return console.log("✅ Email sent successfully:",a.messageId),{success:!0,messageId:a.messageId}}catch(e){return console.error("❌ Email sending failed:",e),{success:!1,error:e instanceof Error?e.message:"Unknown error"}}},c=async e=>{let t=new Date().toLocaleString("en-IN",{timeZone:"Asia/Kolkata",year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"}),a=process.env.ADMIN_EMAIL||process.env.MAIL_FROM;if(!a)throw Error("Admin email not configured");let i=l.contactFormNotification({...e,submittedAt:t}),o=await d({to:a,subject:i.subject,html:i.html,text:i.text}),s=await l.contactFormAutoReply({name:e.name,subject:e.subject});return{adminNotification:o,customerAutoReply:await d({to:e.email,subject:s.subject,html:s.html,text:s.text})}},m=async e=>{let t=[];for(let a of e.recipients){let i=l.customNotification({subject:e.subject,content:e.content,recipientName:e.recipientNames?.[a]}),o=await d({to:a,subject:i.subject,html:i.html,text:i.text});t.push({email:a,result:o})}return t}},78335:()=>{},96487:()=>{}};