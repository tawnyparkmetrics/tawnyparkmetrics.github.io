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
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
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

      {/* Draft Boards Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Max Savin's Draft Board Card */}
          <div className="bg-[#19191A] border border-white/20 rounded-xl p-6 hover:border-white/40 transition-all duration-300 group">
            <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-white/80 transition-colors">
              Max Savin&apos;s Draft Board
            </h2>
            <p className="text-gray-400 mb-4">
              Explore <a href="https://x.com/supersayansavin" className="text-blue-400 hover:text-blue-300 transition-colors">@supersayansavin</a>&apos;s model, featuring EPM projections, prospect tiers, skills graphs, and player comps.
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
              Nick Kalinowski&apos;s Draft Board
            </h2>
            <p className="text-gray-400 mb-4">
              Check out <a href="https://x.com/kalidrafts?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor" className="text-blue-400 hover:text-blue-300 transition-colors">@kalidrafts</a>&apos;s model, which ranks prospects by predicted EPM across the length of their rookie contract using up to 535 unique predictors.
            </p>
            <Link href="/TPM_Draft_Page" className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors">
              <span className="text-sm font-medium">View Draft Board</span>
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Support TPM Section */}
        {/* <div className="bg-gray-800/20 border border-gray-800 rounded-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">Support TPM</h2>
          <div className="text-gray-300 text-lg leading-relaxed space-y-4">
            <p>
              You can first support TPM by donating <a href="" className="text-blue-400 hover:text-blue-300 transition-colors font-semibold">here</a>. Up to this point, <strong className="text-white">all the work you see on the site has been unpaid</strong>. As an aspiring venture, we need to fundraise to support the site, expand, and continue producing high-level analysis.
            </p>
            <p>
              Any donations are tremendously appreciated – we can't overstate enough how much they'll mean to us – and will <strong className="text-white">enable our growth</strong>. Moreover, anyone who contributes will receive that donation value as a discount off an upcoming subscription service we hope to implement in the coming months (note, any donations that exceed the yearly cost of the subscription will simply result in a free service – i.e. 100% off). The primary benefit of this subscription will be access to the dataset Max uses for his draft model, uniquely standardized by age and level of competition.
            </p>
            <p>
              However, <strong className="text-white">foremost, we are grateful that you are even visiting and engaging with the site to begin with</strong>. Sharing TPM with anyone who might be interested is another incredibly helpful way to support our work.
            </p>
          </div>
        </div> */}

        {/* Join TPM Section */}
        {/* <div className="bg-gray-800/20 border border-gray-800 rounded-xl p-8">
          <h2 className="text-3xl font-bold text-white mb-6">Join TPM</h2>
          <div className="text-gray-300 text-lg leading-relaxed space-y-4">
            <p>
              <strong className="text-white">We are actively seeking other draft boards to host on the site</strong>. If you have your own draft analysis – it does not have to be a draft model – hit us up via mes9950@stern.nyu.edu or direct message <a href="https://x.com/supersayansavin" className="text-blue-400 hover:text-blue-300 transition-colors">@supersayansavin</a>. Your board will not be exclusive to TPM in any way; you are absolutely welcome to display it via other means as well. <strong className="text-white">Our goal is to create a platform where it's easy to share your work for no cost, very limited additional effort, and as close to no downside as possible.</strong>
            </p>
            <p>
              While hosting work, such as a draft board, means being associated with TPM, it unequivocally does not require any long-term commitment. There's no expectation that you will be a part of business development or strategic decisions going forward.
            </p>
            <p>
              If you are interested in joining Tawny Park Metrics, in a business role, we encourage you to apply <a href="" className="text-blue-400 hover:text-blue-300 transition-colors font-semibold">here</a>. If there's a way you think you can contribute, let us know and we'll get back to you.
            </p>
          </div>
        </div> */}
      </div>
    </main>
  );
}