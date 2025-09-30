'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Target,
  TrendingUp,
  Users,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Sparkles,
  Shield,
  Clock,
  Award,
  ChevronRight,
  Settings
} from 'lucide-react';

export default function Marketing() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Target className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold text-white">StrategicPlan</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-300 hover:text-white transition">Features</a>
              <a href="#pricing" className="text-slate-300 hover:text-white transition">Pricing</a>
              <a href="#resources" className="text-slate-300 hover:text-white transition">Resources</a>
              <Button
                variant="outline"
                className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => router.push('/admin')}
              >
                Sign In
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => router.push('/admin')}
              >
                Start Building <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full mb-8">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-blue-400 font-medium">New: AI-Powered Goal Recommendations</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Master Strategic
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Planning
            </span>
          </h1>

          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-12">
            Build comprehensive, data-driven strategic plans for your educational institution.
            From district-wide objectives to classroom-level metrics, achieve your goals with
            clarity and confidence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto max-w-md">
              <Input
                placeholder="Enter your work email"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
              <Button
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8"
                onClick={() => router.push('/admin')}
              >
                Start Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <p className="text-sm text-slate-500 mt-4">
            Free trial • No credit card required • Join 5,000+ districts
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
            <div>
              <div className="flex items-center justify-center gap-2 text-blue-400 mb-2">
                <Clock className="h-5 w-5" />
                <span className="text-2xl font-bold">50%</span>
              </div>
              <p className="text-sm text-slate-400">Time Saved</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 text-cyan-400 mb-2">
                <TrendingUp className="h-5 w-5" />
                <span className="text-2xl font-bold">3x</span>
              </div>
              <p className="text-sm text-slate-400">Goal Achievement</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
                <Award className="h-5 w-5" />
                <span className="text-2xl font-bold">98%</span>
              </div>
              <p className="text-sm text-slate-400">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need for Strategic Excellence
            </h2>
            <p className="text-xl text-slate-400">
              Powerful features designed for educational leaders
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-blue-400" />
                </div>
                <CardTitle className="text-white">Hierarchical Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">
                  Create multi-level strategic objectives, goals, and sub-goals with automatic numbering and progress tracking.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="h-12 w-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-cyan-400" />
                </div>
                <CardTitle className="text-white">Real-Time Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">
                  Monitor progress with interactive dashboards, custom metrics, and automated reporting tools.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="h-12 w-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
                <CardTitle className="text-white">Collaborative Planning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">
                  Engage stakeholders with role-based access, commenting, and approval workflows.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full mb-6">
              <Shield className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-400">Simple Pricing</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Planning Path</span>
            </h2>
            <p className="text-xl text-slate-400">
              Start free and scale as you grow. All plans include lifetime updates.
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="bg-slate-800 rounded-full p-1 flex">
              <button className="px-6 py-2 bg-slate-700 text-white rounded-full">Monthly</button>
              <button className="px-6 py-2 text-slate-400 rounded-full flex items-center gap-2">
                Annual <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Save 30%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Starter</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">$0</span>
                  <span className="text-slate-400">/month</span>
                </div>
                <p className="text-slate-400 mt-2">Perfect for small districts</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Up to 3 strategic objectives
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Basic dashboard
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Email support
                  </li>
                </ul>
                <Button
                  className="w-full mt-6 bg-slate-700 hover:bg-slate-600 text-white"
                  onClick={() => router.push('/admin')}
                >
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="bg-gradient-to-b from-blue-900/50 to-slate-800 border-blue-500/50 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm px-3 py-1 rounded-full">
                Most Popular
              </div>
              <CardHeader>
                <CardTitle className="text-white">Professional</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">$49</span>
                  <span className="text-slate-400">/month</span>
                </div>
                <p className="text-slate-400 mt-2">For growing districts</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Unlimited objectives & goals
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Advanced analytics
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Custom metrics
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Priority support
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    API access
                  </li>
                </ul>
                <Button
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                  onClick={() => router.push('/admin')}
                >
                  Start Pro Plan
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Enterprise</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">$199</span>
                  <span className="text-slate-400">/month</span>
                </div>
                <p className="text-slate-400 mt-2">For large organizations</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Everything in Pro
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Multiple districts
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Custom onboarding
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Dedicated support
                  </li>
                  <li className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    SLA guarantee
                  </li>
                </ul>
                <Button
                  className="w-full mt-6 bg-slate-700 hover:bg-slate-600 text-white"
                  onClick={() => router.push('/admin')}
                >
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Strategic Planning?
          </h2>
          <p className="text-xl text-slate-400 mb-8">
            Join thousands of educational leaders who are achieving their goals with clarity and confidence.
          </p>
          <Button
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-6 text-lg"
            onClick={() => router.push('/admin')}
          >
            Start Your Free Trial <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 text-blue-500" />
              <span className="text-white font-semibold">StrategicPlan</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Terms</a>
              <a href="#" className="hover:text-white transition">Support</a>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
                onClick={() => router.push('/')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Back to App
              </Button>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
            © 2025 StrategicPlan. All rights reserved. Built for educational excellence.
          </div>
        </div>
      </footer>
    </div>
  );
}