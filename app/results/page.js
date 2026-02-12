'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Heart,
  Printer,
  ArrowRight,
  ExternalLink,
  Loader2,
  AlertCircle,
  Home,
  RefreshCw,
} from 'lucide-react';

function ResultsContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (!id) {
      setError('No submission ID provided');
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/public-results/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load results');
        }

        setResults(data);
      } catch (err) {
        setError(err.message || 'Unable to load results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F1E9]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#D08C60] mx-auto mb-4" />
          <p className="text-xl text-muted">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F1E9] p-4">
        <Card className="max-w-md w-full border-[#E8DDCF]">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#3D3530] mb-2">Unable to Load Results</h1>
            <p className="text-muted mb-6">{error}</p>
            <div className="flex flex-col gap-3">
              <Link href="/start">
                <Button className="w-full text-lg h-12 bg-[#D08C60] hover:bg-[#B76E45]">
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Start Over
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full text-lg h-12 border-[#E8DDCF]">
                  <Home className="w-5 h-5 mr-2" />
                  Go Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const matchedBenefits = results?.matched_benefits || [];

  return (
    <div className="min-h-screen bg-[#F8F1E9]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#E8DDCF] no-print">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#D08C60] rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#3D3530]">BenefitBuddy</span>
          </Link>
          <Button variant="outline" onClick={handlePrint} className="border-[#E8DDCF]">
            <Printer className="w-4 h-4 mr-2" />
            Print Results
          </Button>
        </div>
      </header>

      {/* Print Header */}
      <div className="hidden print-only print:block p-4 border-b">
        <h1 className="text-2xl font-bold">BenefitBuddy - Your Results</h1>
        <p className="text-muted">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Results Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#3D3530] mb-3">
            🎉 Your Recommended Programs
          </h1>
          <p className="text-xl text-muted senior-text">
            Based on your answers, you may be eligible for {matchedBenefits.length} program{matchedBenefits.length !== 1 ? 's' : ''}.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="bg-[#FEF3E2] border border-[#E8DDCF] rounded-lg p-4 mb-8">
          <p className="text-[#8B6914]">
            <strong>⚠️ Important:</strong> These are suggestions based on general eligibility guidelines. 
            Actual eligibility depends on many factors. Please verify with the official agencies listed below.
          </p>
        </div>

        {/* Benefits Cards */}
        {matchedBenefits.length === 0 ? (
          <Card className="border-2 border-[#E8DDCF]">
            <CardContent className="p-8 text-center">
              <p className="text-xl text-muted mb-4">
                Based on your answers, we didn't find specific programs to recommend.
              </p>
              <p className="text-muted mb-6">
                This doesn't mean you're not eligible for assistance. Visit Benefits.gov for a complete search.
              </p>
              <a href="https://www.benefits.gov" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="text-lg bg-[#D08C60] hover:bg-[#B76E45]">
                  Search All Benefits at Benefits.gov
                  <ExternalLink className="ml-2 w-5 h-5" />
                </Button>
              </a>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {matchedBenefits.map((benefit) => (
              <Card key={benefit.id} className={`benefit-card border-2 border-l-4 border-[#E8DDCF] ${benefit.color}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl md:text-2xl text-[#3D3530]">
                    <span className="text-3xl">{benefit.icon}</span>
                    {benefit.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted senior-text">{benefit.description}</p>
                  
                  <div className="bg-[#FFF8F0] p-4 rounded-lg border border-[#E8DDCF]">
                    <p className="text-[#8B6914] font-medium">
                      <strong>Why this matched:</strong> {benefit.reason}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-lg mb-2 text-[#3D3530]">Next Steps:</h4>
                    <ol className="list-decimal list-inside space-y-2">
                      {benefit.nextSteps.map((step, i) => (
                        <li key={i} className="text-muted senior-text">{step}</li>
                      ))}
                    </ol>
                  </div>

                  <a 
                    href={benefit.officialLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Button className="mt-2 text-lg h-12 bg-[#D08C60] hover:bg-[#B76E45]">
                      Learn More & Apply
                      <ExternalLink className="ml-2 w-5 h-5" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Additional Resources */}
        <Card className="mt-8 border-2 border-[#E8DDCF] no-print">
          <CardHeader>
            <CardTitle className="text-xl text-[#3D3530]">📘 Additional Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a 
              href="https://www.benefits.gov" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#D08C60] hover:text-[#B76E45] hover:underline senior-text"
            >
              Benefits.gov - Search all federal benefits
              <ExternalLink className="w-4 h-4" />
            </a>
            <a 
              href="https://www.findhelp.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#D08C60] hover:text-[#B76E45] hover:underline senior-text"
            >
              FindHelp.org - Local assistance programs
              <ExternalLink className="w-4 h-4" />
            </a>
            <a 
              href="https://www.211.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#D08C60] hover:text-[#B76E45] hover:underline senior-text"
            >
              211.org - Call 211 for local help
              <ExternalLink className="w-4 h-4" />
            </a>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-8 no-print">
          <Link href="/start">
            <Button variant="outline" size="lg" className="text-lg h-12 border-[#E8DDCF] text-[#6B625A] hover:bg-[#FFF8F0]">
              <RefreshCw className="w-5 h-5 mr-2" />
              Start Over with New Answers
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#FFF8F0] border-t border-[#E8DDCF] mt-12 py-6 no-print">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-muted text-sm">
            BenefitBuddy is not affiliated with any government agency. 
            For official information, please visit the agency websites directly.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F8F1E9]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#D08C60] mx-auto mb-4" />
          <p className="text-xl text-muted">Loading your results...</p>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
