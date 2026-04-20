import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import './globals.css'

const rawFbPixelId = (process.env.NEXT_PUBLIC_FB_PIXEL_ID || '').trim()
const hasValidFbPixelId = /^\d{8,20}$/.test(rawFbPixelId)

export const metadata: Metadata = {
  title: 'ASBL Loft | Luxury 3BHK in Hyderabad',
  description: 'Experience premium luxury living at ASBL Loft, a G+45 residential project in Financial District, Gachibowli. 1,695 sq. ft. 3BHKs starting from ₹1.94 Cr.',
  generator: 'v0.app',
  icons: {
    icon: [ 
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-5GPRCJGL');`,
          }}
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-798121015" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'AW-798121015');`,
          }}
        />
      </head>
      <body className="font-lato antialiased bg-[#9D5088] text-[#FFFFFF]">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5GPRCJGL"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {hasValidFbPixelId ? (
          <Script
            id="meta-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s){
                if(f.fbq)return;n=f.fbq=function(){
                n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;
                n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];
                t=b.createElement(e);t.async=!0;
                t.src=v;
                s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)
                }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');

                fbq('init', '${rawFbPixelId}');
                fbq('track', 'PageView');
              `,
            }}
          />
        ) : null}
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
