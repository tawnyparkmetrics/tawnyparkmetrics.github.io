"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import NavigationHeader from '@/components/NavigationHeader';
import { GoogleAnalytics } from '@next/third-parties/google';
import { ChevronRight, ChevronDown } from 'lucide-react';

export default function Home() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <main className="min-h-screen bg-[#19191A]">
      <NavigationHeader activeTab="Home" />
      <GoogleAnalytics gaId="G-X22HKJ13B7" />

      {/* Full Screen Hero with Basketball Texture */}
      <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#19191A]">
        {/* Basketball Texture Background - Fixed Position */}
        <img
          src="/B&W Basketball Transparent.png"
          alt=""
          className="fixed top-[60vh] right-0 -translate-y-1/2 max-w-4xl opacity-50 pointer-events-none z-0"
        />

        {/* Main Content */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-10">
          {/* Logo and Title */}
          <div className="text-center mb-12">
            <div className="flex justify-center">
              <Image
                src="/TPM_logo_designs/TPM Square Transparent.png"
                alt="TPM Logo"
                width={200}
                height={200}
                className="w-48 h-48"
                priority
              />
            </div>
            <h1 className="text-md font-bold text-white tracking-wide">
              TAWNY PARK METRICS
            </h1>
          </div>

          {/* Navigation Buttons */}
          <div className="space-y-4">

            {/* NBA Combine Score */}
            <div className="max-w-md">
              <Link href="/nba-draft-history">
                <button className="w-full bg-transparent border-2 border-white/40 rounded-2xl px-7 py-5 text-white text-xl md:text-2xl font-semibold hover:border-white/80 hover:bg-white/5 transition-all duration-300 flex items-center justify-between group">
                  <span>NBA DRAFT HISTORY</span>
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>

            <div></div>
            {/* NBA Combine Score */}
            <div className="max-w-md">
              <Link href="/nba-combine-score">
                <button className="w-full bg-transparent border-2 border-white/40 rounded-2xl px-7 py-5 text-white text-xl md:text-2xl font-semibold hover:border-white/80 hover:bg-white/5 transition-all duration-300 flex items-center justify-between group">
                  <span>NBA COMBINE SCORE</span>
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>

            <div></div>

            {/* NBA Draft Consensus */}
            <div className="max-w-md">
              <Link href="/consensus-nba-draft-board">
                <button className="w-full bg-transparent border-2 border-white/40 rounded-2xl px-7 py-5 text-white text-xl md:text-2xl font-semibold hover:border-white/80 hover:bg-white/5 transition-all duration-300 flex items-center justify-between group">
                  <span>NBA DRAFT CONSENSUS</span>
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>

            {/* NBA Draft Boards - Accordion */}
            <div className="max-w-md">
              <button
                onClick={() => toggleSection('draft-boards')}
                className="w-full bg-transparent border-2 border-white/40 rounded-2xl px-7 py-5 text-white text-xl md:text-2xl font-semibold hover:border-white/80 hover:bg-white/5 transition-all duration-300 flex items-center justify-between"
              >
                <span>NBA DRAFT BOARDS</span>
                <ChevronDown
                  className={`w-6 h-6 transition-transform duration-300 ${expandedSection === 'draft-boards' ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {expandedSection === 'draft-boards' && (
                <div className="mt-3 space-y-3 animate-fadeIn">
                  <Link href="/max-nba-draft-board">
                    <div className="bg-white/5 border border-white/20 rounded-xl px-7 py-5 hover:bg-white/10 transition-all cursor-pointer">
                      <h3 className="text-white font-semibold text-lg mb-1">Max's Draft Board</h3>
                      <p className="text-white text-sm">Explore <a href="https://x.com/supersayansavin" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">@supersayansavin</a>'s model featuring EPM projections, prospect tiers, skills graphs, and player comps.</p>
                    </div>
                  </Link>

                  <div className="h-2"></div>

                  <Link href="/nick-nba-draft-board">
                    <div className="bg-white/5 border border-white/20 rounded-xl px-7 py-5 hover:bg-white/10 transition-all cursor-pointer relative group">
                      <img
                        src="/nbateam_logos/Denver Nuggets.png"
                        alt="Denver Nuggets"
                        className="absolute top-3 right-3 w-8 h-8 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-90 transition-all"
                      />
                      <h3 className="text-white font-semibold text-lg mb-1">Nick's Draft Board</h3>
                      <p className="text-white text-sm">Check out <a href="https://x.com/kalidrafts" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">@kalidrafts</a>'s model ranking prospect by predicted EPM. Nick now works for the Denver Nuggets.</p>
                    </div>
                  </Link>

                  <div className="h-2"></div>

                  <Link href="/andre-nba-draft-board">
                    <div className="bg-white/5 border border-white/20 rounded-xl px-7 py-5 hover:bg-white/10 transition-all cursor-pointer">
                      <h3 className="text-white font-semibold text-lg mb-1">Andre's Draft Board</h3>
                      <p className="text-white text-sm">Dive into <a href="https://x.com/undraliu" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">@undraliu</a>'s "Flagg Plant Score," which analyzes prospects via original metric and clustered tiers.</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* About TPM - Accordion */}
            <div className="max-w-md">
              <button
                onClick={() => toggleSection('about')}
                className="w-full bg-transparent border-2 border-white/40 rounded-2xl px-7 py-5 text-white text-xl md:text-2xl font-semibold hover:border-white/80 hover:bg-white/5 transition-all duration-300 flex items-center justify-between"
              >
                <span>ABOUT TPM</span>
                <ChevronDown
                  className={`w-6 h-6 transition-transform duration-300 ${expandedSection === 'about' ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {expandedSection === 'about' && (
                <div className="mt-3 bg-white/5 border border-white/20 rounded-xl px-6 py-5 animate-fadeIn">
                  <p className="text-gray-300 leading-relaxed mb-3">
                    <strong className="text-white">Tawny Park Metrics (TPM)</strong> is a platform for thoughtful and disruptive sports analysis. The name comes from the local park we've hooped at almost all our lives. It's our way to put Tawny Park on the map.
                  </p>
                  <p className="text-white leading-relaxed">
                    While "Metrics" implies a focus on data analysis, we are committed to offering a wide range of insights. Moreover, we intend to supplement our analysis with media content in the near future.
                  </p>
                </div>
              )}
            </div>

            {/* Contact & Support - Accordion */}
            <div className="max-w-md">
              <button
                onClick={() => toggleSection('support')}
                className="w-full bg-transparent border-2 border-white/40 rounded-2xl px-7 py-5 text-white text-xl md:text-2xl font-semibold hover:border-white/80 hover:bg-white/5 transition-all duration-300 flex items-center justify-between"
              >
                <span>CONTACT & SUPPORT</span>
                <ChevronDown
                  className={`w-6 h-6 transition-transform duration-300 ${expandedSection === 'support' ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {expandedSection === 'support' && (
                <div className="mt-3 bg-white/5 border border-white/20 rounded-xl px-6 py-5 animate-fadeIn">
                  <p className="text-white leading-relaxed">
                    Support TPM by donating <a href="https://buymeacoffee.com/tawnypark" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-semibold underline">here</a>. <strong className="text-white">All work on this site has been unpaid</strong>. Your donations enable our growth and are tremendously appreciated. Sharing TPM with others is another incredibly helpful way to support our work.
                  </p>
                </div>
              )}
            </div>

            {/* How to Join - Accordion */}
            <div className="max-w-md">
              <button
                onClick={() => toggleSection('join')}
                className="w-full bg-transparent border-2 border-white/40 rounded-2xl px-7 py-5 text-white text-xl md:text-2xl font-semibold hover:border-white/80 hover:bg-white/5 transition-all duration-300 flex items-center justify-between"
              >
                <span>HOW TO JOIN</span>
                <ChevronDown
                  className={`w-6 h-6 transition-transform duration-300 ${expandedSection === 'join' ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {expandedSection === 'join' && (
                <div className="mt-3 bg-white/5 border border-white/20 rounded-xl px-6 py-5 animate-fadeIn">
                  <p className="text-white leading-relaxed">
                    <strong className="text-white">We are actively seeking other draft boards to host on the site</strong>. If you have your own draft analysis, contact us at mes9950@stern.nyu.edu or DM <a href="https://x.com/supersayansavin" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">@supersayansavin</a>. Your board won't be exclusive to TPM. <strong className="text-white">Our goal is to create a platform where it's easy to share your work for no cost and minimal effort.</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}