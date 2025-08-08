"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
//import ComingSoon from '../components/ui/ComingSoon';
import NavigationHeader from '@/components/NavigationHeader';
import { GoogleAnalytics } from '@next/third-parties/google';


export default function Home() {
  return (
    <main className="min-h-screen bg-[#19191A]">
      <NavigationHeader activeTab="Home" />
      <GoogleAnalytics  gaId="G-X22HKJ13B7" />
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

      {/* Consensus and NBA Draft History Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* NBA Draft History Section */}
          <Link href="/nba-draft-history" className="block">
            <div className="bg-[#19191A] border border-white/20 rounded-xl p-8 hover:border-blue-400/60 hover:bg-[#1a1a1b] hover:shadow-lg hover:shadow-blue-400/20 hover:scale-[1.02] transition-all duration-300 group cursor-pointer h-full">
              <div className="text-gray-300 text-lg leading-relaxed">
                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">
                  NBA Draft History
                </h2>
                <p>
                  Review past NBA Draft classes (2020-2025).
                </p>
              </div>
            </div>
          </Link>

          {/* Consensus Section */}
          <Link href="/consensus-nba-board" className="block">
            <div className="bg-[#19191A] border border-white/20 rounded-xl p-8 hover:border-blue-400/60 hover:bg-[#1a1a1b] hover:shadow-lg hover:shadow-blue-400/20 hover:scale-[1.02] transition-all duration-300 group cursor-pointer h-full">
              <div className="text-gray-300 text-lg leading-relaxed">
                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">
                  NBA Draft Consensus Board
                </h2>
                <p>
                  Aggregate of individual boards published before each draft.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Draft Boards Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Max Savin's Draft Board Card */}
          <Link href="/max-nba-draft-board" className="block">
            <div className="bg-[#19191A] border border-white/20 rounded-xl p-6 hover:border-blue-400/60 hover:bg-[#1a1a1b] hover:shadow-lg hover:shadow-blue-400/20 hover:scale-[1.02] transition-all duration-300 group cursor-pointer h-full">
              <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">
                Max&apos;s Draft Board
              </h2>
              <p className="text-gray-400">
                Explore <a href="https://x.com/supersayansavin" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors" onClick={(e) => e.stopPropagation()}>@supersayansavin</a>&apos;s model featuring EPM projections, prospect tiers, skills graphs, and player comps.
              </p>
            </div>
          </Link>

          {/* Nick Kalinowski's Draft Board Card */}
          <Link href="/nick-nba-draft-board" className="block">
            <div className="bg-[#19191A] border border-white/20 rounded-xl p-6 hover:border-blue-400/60 hover:bg-[#1a1a1b] hover:shadow-lg hover:shadow-blue-400/20 hover:scale-[1.02] transition-all duration-300 group cursor-pointer h-full">
              <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">
                Nick&apos;s Draft Board
              </h2>
              <p className="text-gray-400">
                Check out <a href="https://x.com/kalidrafts?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors" onClick={(e) => e.stopPropagation()}>@kalidrafts</a>&apos;s model ranking prospects by predicted EPM using up to 535 unique predictors.
              </p>
            </div>
          </Link>

          {/* Andre Liu's Draft Board Card */}
          <Link href="/andre-nba-draft-board" className="block">
            <div className="bg-[#19191A] border border-white/20 rounded-xl p-6 hover:border-blue-400/60 hover:bg-[#1a1a1b] hover:shadow-lg hover:shadow-blue-400/20 hover:scale-[1.02] transition-all duration-300 group cursor-pointer h-full">
              <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">
                Andre&apos;s Draft Board
              </h2>
              <p className="text-gray-400">
                Dive into <a href="https://x.com/undraliu?s=11&t=aZX-xts5orQ1PkjaZOO7FQ" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors" onClick={(e) => e.stopPropagation()}>@undraliu</a>&apos;s &quot;Flagg Plant Score,&quot; which analyzes prospects via original metrics and clustered tiers.
              </p>
            </div>
          </Link>
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