import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-bold">SF</span>
            <span className="text-lg font-extrabold tracking-tight">SparkFund</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-sm">
            Crowdfunding for a new generation. Back ideas you believe in and help founders build the future.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold">Product</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/my-campaigns" className="hover:text-foreground">My Campaigns</Link></li>
              <li><Link to="/create" className="hover:text-foreground">Start a campaign</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">About</a></li>
              <li><a href="#" className="hover:text-foreground">Blog</a></li>
            </ul>
          </div>
        </div>
        <div className="text-sm text-muted-foreground md:text-right">
          <p>© {new Date().getFullYear()} SparkFund. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
