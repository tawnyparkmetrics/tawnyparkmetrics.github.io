"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
//import ComingSoon from '../components/ui/ComingSoon';
import NavigationHeader from '@/components/NavigationHeader';


export default function Home() {
  return (
    <main className="min-h-screen bg-[#19191A]">
      <NavigationHeader activeTab="Home" />
      
      {/* Hero Section - Reduced top padding from pt-20 to pt-12 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="bg-[#19191A] border border-white/20 rounded-xl p-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Logo */}
            <div className="flex-shrink-0 relative">
              <Image
                src="/TPM_logo_designs/TPM Square (Dark with Map).png"
                alt="TPM Logo"
                width={224}  // 56 * 4 for md size
                height={224} // 56 * 4 for md size
                className="w-40 h-40 md:w-56 md:h-56"
                priority // Add priority since this is above the fold
              />
            </div>
            
            {/* Text Content */}
            <div className="flex-grow text-gray-300 text-lg leading-relaxed">
              <p className="mb-4">
                <strong className="text-white">Tawny Park Metrics (TPM)</strong> is a platform for thoughtful and disruptive sports analysis. The name comes from the local park we&apos;ve hooped at almost all our lives. It&apos;s our way to put Tawny Park on the map. Accordingly, almost everyone involved with TPM&apos;s inception has known each other, at least, since middle school.
              </p>
              <p>
                While &quot;Metrics&quot; implies a focus on data analysis, we are committed to offering a wide range of insights. Moreover, we intend to supplement our analysis with media content in the near future.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Consensus Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-[#19191A] border border-white/20 rounded-xl p-8 hover:border-white/40 transition-all duration-300 group">
          <div className="text-gray-300 text-lg leading-relaxed">
            <h2 className="text-3xl font-bold text-white mb-4 group-hover:text-white/80 transition-colors">
              2025 NBA Draft Consensus Board
            </h2>
            <p className="mb-6">
              Aggregate of 158 boards, all published & submitted before the 2025 NBA Draft. Thank you to everyone who helps put this consensus together, including: <a href="https://twitter.com/mikegrib8" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">@mikegrib8</a>, <a href="https://twitter.com/thegrantedwards" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">@thegrantedwards</a>, <a href="https://twitter.com/codyreeves14" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">@codyreeves14</a>, <a href="https://twitter.com/dualbarl" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">@dualbarl</a>, <a href="https://twitter.com/CannibalSerb" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">@CannibalSerb</a>, <a href="https://twitter.com/bendog28" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">@bendog28</a>, <a href="https://twitter.com/BalaRavikumar5" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">@BalaRavikumar5</a>, & <a href="https://twitter.com/supersayansavin" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">@supersayansavin</a>. Only displaying prospects who appear on at least 10 boards. Prospects are ordered via a weighted combination of average (mean) rank & inclusion rate.            </p>
            <Link href="/Consensus" className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors group-hover:text-blue-300">
              <span className="text-lg font-medium">View Consensus Board</span>
              <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Draft Boards Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Max Savin's Draft Board Card */}
          <div className="bg-[#19191A] border border-white/20 rounded-xl p-6 hover:border-white/40 transition-all duration-300 group">
            <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-white/80 transition-colors">
              Max&apos;s Draft Board
            </h2>
            <p className="text-gray-400 mb-4">
              Explore <a href="https://x.com/supersayansavin" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">@supersayansavin</a>&apos;s model featuring EPM projections, prospect tiers, skills graphs, and player comps.
            </p>
            <Link href="/TPM_Draft_Page" className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors">
              <span className="text-sm font-medium">View Draft Board</span>
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Nick Kalinowski's Draft Board Card */}
          <div className="bg-[#19191A] border border-white/20 rounded-xl p-6 hover:border-white/40 transition-all duration-300 group">
            <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-white/80 transition-colors">
              Nick&apos;s Draft Board
            </h2>
            <p className="text-gray-400 mb-4">
              Check out <a href="https://x.com/kalidrafts?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">@kalidrafts</a>&apos;s model ranking prospects by predicted EPM using up to 535 unique predictors.
            </p>
            <Link href="/Nick_Draft_Page" className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors">
              <span className="text-sm font-medium">View Draft Board</span>
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Andre Liu's Draft Board Card */}
          <div className="bg-[#19191A] border border-white/20 rounded-xl p-6 hover:border-white/40 transition-all duration-300 group">
            <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-white/80 transition-colors">
              Andre&apos;s Draft Board
            </h2>
            <p className="text-gray-400 mb-4">
              Dive into <a href="https://x.com/undraliu?s=11&t=aZX-xts5orQ1PkjaZOO7FQ" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">@undraliu</a>&apos;s &quot;Flagg Plant Score,&quot; which analyzes prospects via original metrics and clustered tiers.
            </p>
            <Link href="/Andre_Draft_Page" className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors">
              <span className="text-sm font-medium">View Draft Board</span>
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Support TPM and Join TPM Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Support TPM Section */}
          <div className="bg-[#19191A] border border-white/20 rounded-xl p-6">
            <h2 className="text-3xl font-bold text-white mb-4">Support TPM</h2>
            <div className="text-gray-300 text-base leading-relaxed space-y-4">
              <p>
                You can first support TPM by donating <a href="https://buymeacoffee.com/tawnypark" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors font-semibold underline">here</a>. Up to this point, <strong className="text-white">all the work you see on the site has been unpaid</strong>. Any donations are tremendously appreciated – we can&apos;t overstate enough how much they&apos;ll mean to us – and will <strong className="text-white">enable our growth</strong>. However, <strong className="text-white">foremost, we are grateful that you are even visiting and engaging with the site to begin with</strong>. Sharing TPM with anyone who might be interested is another incredibly helpful way to support our work.
              </p>
            </div>
          </div>

          {/* Join TPM Section */}
          <div className="bg-[#19191A] border border-white/20 rounded-xl p-6">
            <h2 className="text-3xl font-bold text-white mb-4">Join TPM</h2>
            <div className="text-gray-300 text-base leading-relaxed space-y-4">
              <p>
                <strong className="text-white">We are actively seeking other draft boards to host on the site</strong>. If you have your own draft analysis – it does not have to be a draft model – hit us up via mes9950@stern.nyu.edu or direct message <a href="https://x.com/supersayansavin" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">@supersayansavin</a>. Your board will not be exclusive to TPM in any way; you are absolutely welcome to display it via other means as well. <strong className="text-white">Our goal is to create a platform where it&apos;s easy to share your work for no cost, very limited additional effort, and as close to no downside as possible.</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}