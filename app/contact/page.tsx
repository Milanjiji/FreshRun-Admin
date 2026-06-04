import React from "react";
import { Mail, Phone, MapPin, Clock, MessageSquare, ExternalLink } from "lucide-react";

export default function ContactUs() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* Header Section */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary mb-2">
          <MessageSquare size={40} />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-foreground font-mont">Contact Us</h1>
        <p className="text-muted text-lg font-medium">We're here to help you. Get in touch with our team.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Contact Information */}
        <div className="space-y-8">
           <h2 className="text-2xl font-bold font-mont">Get in Touch</h2>
           
           <div className="space-y-6">
              <ContactCard 
                icon={<Mail className="text-primary" size={24} />}
                title="Email Support"
                value="support@freshrun.com"
                link="mailto:support@freshrun.com"
              />
              <ContactCard 
                icon={<Phone className="text-primary" size={24} />}
                title="Phone Support"
                value="+91 98765 43210"
                link="tel:+919876543210"
              />
              <ContactCard 
                icon={<MapPin className="text-primary" size={24} />}
                title="Office Location"
                value="Beach Road, Punnapra, Alappuzha, Kerala - 688005"
              />
           </div>

           <div className="p-6 rounded-2xl bg-surface border border-border shadow-sm">
              <h4 className="font-bold flex items-center gap-2 mb-3">
                 <Clock size={18} className="text-muted" />
                 Support Hours
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                 <li className="flex justify-between">
                    <span>Monday - Saturday</span>
                    <span className="font-bold text-foreground">9:00 AM - 10:00 PM</span>
                 </li>
                 <li className="flex justify-between">
                    <span>Sunday</span>
                    <span className="font-bold text-foreground">10:00 AM - 6:00 PM</span>
                 </li>
              </ul>
           </div>
        </div>

        {/* Contact Form / Socials */}
        <div className="bg-surface rounded-3xl border border-border p-8 shadow-sm h-fit">
           <h3 className="text-xl font-bold mb-6">Quick Contact</h3>
           <form className="space-y-4">
              <div>
                 <label className="block text-xs font-bold text-muted uppercase mb-1.5">Full Name</label>
                 <input type="text" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all" placeholder="Enter your name" />
              </div>
              <div>
                 <label className="block text-xs font-bold text-muted uppercase mb-1.5">Email Address</label>
                 <input type="email" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all" placeholder="your@email.com" />
              </div>
              <div>
                 <label className="block text-xs font-bold text-muted uppercase mb-1.5">Message</label>
                 <textarea className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all resize-none" rows={4} placeholder="How can we help you?"></textarea>
              </div>
              <button className="w-full bg-primary text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">Send Message</button>
           </form>
        </div>

      </div>

      <section className="p-10 rounded-3xl bg-background border border-border text-center">
         <h2 className="text-2xl font-bold font-mont mb-4">Follow Our Journey</h2>
         <div className="flex justify-center gap-6">
            <SocialLink name="Instagram" />
            <SocialLink name="Facebook" />
            <SocialLink name="Twitter" />
         </div>
      </section>
    </div>
  );
}

function ContactCard({ icon, title, value, link }: { icon: React.ReactNode, title: string, value: string, link?: string }) {
  const content = (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface border border-border hover:border-primary transition-all group">
       <div className="h-12 w-12 rounded-xl bg-background border border-border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          {icon}
       </div>
       <div className="flex-1">
          <p className="text-xs font-bold text-muted uppercase tracking-wider">{title}</p>
          <p className="text-sm font-bold text-foreground mt-0.5">{value}</p>
       </div>
       {link && <ExternalLink size={16} className="text-border group-hover:text-primary transition-colors" />}
    </div>
  );

  if (link) {
    return <a href={link} className="block">{content}</a>;
  }
  return content;
}

function SocialLink({ name }: { name: string }) {
  return (
    <button className="px-6 py-2 rounded-xl border border-border bg-surface text-sm font-bold hover:text-primary hover:border-primary transition-all">
       {name}
    </button>
  );
}
