import { Link } from 'react-router-dom';
import { FileText, Twitter, Linkedin, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-16 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg gradient-primary">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">AI Resume Scout</span>
            </Link>
            <p className="text-muted-foreground text-sm mb-4">
              AI-powered resume analysis for job seekers. Get your resume job-ready in minutes.
            </p>
            {/* <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div> */}
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Features</a></li>
              <li><a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Pricing</a></li>
              <li><a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors text-sm">How it Works</a></li>
              <li><Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Dashboard</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors text-sm">About</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Contact</Link></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Blog</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Careers</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Terms of Service</Link></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} SkillSync AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
