import { Link } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote, Shield, ArrowRight } from 'lucide-react';

const HomePage = () => {
  const { isAdmin, loading } = useAdminAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Banknote className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">SwiftKopa</h1>
          <p className="text-muted-foreground">Fast, reliable loans when you need them</p>
        </div>

        {/* Main Actions */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Get Started</CardTitle>
            <CardDescription>Choose an option below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild size="lg" className="w-full h-14 text-base font-semibold">
              <Link to="/apply" className="flex items-center justify-center gap-2">
                <Banknote className="w-5 h-5" />
                Apply for a Loan
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Link>
            </Button>

            {!loading && !isAdmin && (
              <Button asChild variant="outline" size="lg" className="w-full h-12 text-base">
                <Link to="/admin" className="flex items-center justify-center gap-2">
                  <Shield className="w-5 h-5" />
                  Admin Login
                </Link>
              </Button>
            )}

            {!loading && isAdmin && (
              <Button asChild variant="secondary" size="lg" className="w-full h-12 text-base">
                <Link to="/admin/dashboard" className="flex items-center justify-center gap-2">
                  <Shield className="w-5 h-5" />
                  Go to Dashboard
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} SwiftKopa. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default HomePage;
