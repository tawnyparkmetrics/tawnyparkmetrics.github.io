"use client";
import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import NavigationHeader from '@/components/NavigationHeader';

interface DropdownSectionProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const DropdownSection = ({ title, children, isOpen, onToggle }: DropdownSectionProps) => (
  <div className="border border-white/20 rounded-lg bg-[#19191A]">
    <button
      onClick={onToggle}
      className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors duration-200"
    >
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      {isOpen ? (
        <ChevronUp className="h-5 w-5 text-white/60" />
      ) : (
        <ChevronDown className="h-5 w-5 text-white/60" />
      )}
    </button>
    {isOpen && (
      <div className="px-6 pb-6 text-gray-300 leading-relaxed">
        {children}
      </div>
    )}
  </div>
);

const ScoreTable = () => (
  <div className="overflow-x-auto my-4">
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-700">
          <th className="border border-gray-600 px-4 py-2 text-left text-white">Component Score</th>
          <th className="border border-gray-600 px-4 py-2 text-left text-white">Measurements Included</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border border-gray-600 px-4 py-2 text-white font-semibold">Physical Score</td>
          <td className="border border-gray-600 px-4 py-2 text-gray-300">
            Height (in.), Standing Reach (in.), Wingspan (in.), Weight (lbs)
          </td>
        </tr>
        <tr className="bg-gray-800/30">
          <td className="border border-gray-600 px-4 py-2 text-white font-semibold">Agility Score</td>
          <td className="border border-gray-600 px-4 py-2 text-gray-300">
            Lane Agility Time, Shuttle Run Time, Three-Quarter Sprint Time
          </td>
        </tr>
        <tr>
          <td className="border border-gray-600 px-4 py-2 text-white font-semibold">Vertical Score</td>
          <td className="border border-gray-600 px-4 py-2 text-gray-300">
            Standing Vertical Leap (in.), Maximum Vertical Leap (in.)
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

export default function CombineScorePage() {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev: Record<string, boolean>) => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  useEffect(() => {
    document.title = 'Combine Score Write-Up | Tawny Park Metrics';
  }, []);

  const sections = [
    {
      id: 'overview',
      title: 'What is Combine Score?',
      content: (
        <div>
          <p className="mb-4">
            Combine Score was <strong>originated by Nick Kalinowski</strong> – inspired by Kent Lee Platte's (<a href="https://x.com/MathBomb" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">@MathBomb</a>) NFL Draft Relative Athletic Score (RAS) – as a means to quantify and compare NBA Draft Combine performance. Nick's web-app, available <a href="https://njk11.pythonanywhere.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">here</a>, has proven a valuable and popular resource each draft cycle, both informing draft enthusiasts and supporting further draft analysis (including <a href="https://tawnyparkmetrics.com/nick-nba-draft-board" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Nick's own draft model</a>, 
            as well as <a href="https://tawnyparkmetrics.com/max-nba-draft-board" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Max's</a>). However, since Nick has graduated to a full-time role with the Denver Nuggets, he is no longer able to publish public-facing work.In hopes of continuing the Combine Score and preserving its public utility, I am picking up where Nick left off.
          </p>
          <p className="mb-4">
            For reference, you can find the entirety of Nick's public-facing work at <a href="https://kalidrafts.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">kalidrafts.com</a>, all of which – beyond just the Combine Score – is worth exploring.
          </p>
          <p className="mb-4">
            Combine Score is derived from the anthropometric data & athletic testing for every NBA Draft Combine participant since 2000 (sourced from <a href="https://www.nba.com/combine/statistics" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">NBA.com</a>). Specifically, this data is converted into three distinct <strong>position-specific percentiles</strong>:
          </p>
          <ol className="list-decimal list-inside space-y-2 ml-4 mb-4">
            <li><strong>Physical Score</strong> – the average of percentile height (in.), standing reach (in.), wingspan (in.), and weight (lbs).</li>
            <li><strong>Agility Score</strong> – the average of percentile lane agility, shuttle run, and three-quarter sprint times.</li>
            <li><strong>Vertical Score</strong> – the average of percentile standing vertical leap (in.) and maximum vertical leap (in.).</li>
          </ol>
          <p>
            Taking the average of these three individual scores produces the <strong>Raw Score</strong>, which is then <strong>rescaled from 0-100</strong> to generate the final (overall) <strong>Combine Score</strong> for each combine participant. This process is almost identical to Nick's original version, as described in further detail on his <a href="https://njk11.pythonanywhere.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">web-app</a>.
          </p>
        </div>
      )
    },
    {
      id: 'differences',
      title: 'How does this version differ from the original?',
      content: (
        <div>
          <p className="mb-4">
            The <strong>biggest differences between these updated Combine Scores and the original derive</strong> almost exclusively from <strong>each player's position designation</strong>, leading to slightly different, but very comparable, final outputs.
            To the best of my knowledge, in the original version, Nick, naturally, used a player's official listed position when calculating the percentile scores. While that approach is both standardized and rational, there are numerous cases where a prospect's listed combine position differs from their expected (and, often, ultimate) NBA role. To help account for this, Nick built an intuitive and dynamic "Custom Data Entry" tool.
          </p>
          <p className="mb-4">
            I took a different approach to calculating Combine Score. To start, Max Savin (my co-founder), helped create an <strong>algorithm to define player positions</strong> using their original Combine listings and height. This worked well for the majority of players. For others, I <strong>manually reviewed their NBA minutes per position</strong> – assigning the one in which they had the most NBA minutes as their primary Combine position. In most cases, these primary positions align with those from the original Combine Score (the official combine listings), but not all – which, in turn, affects the position-relative percentiles (the resulting output).
          </p>
          <p className="mb-4">
            Many, if not most, players spend time at multiple positions. To capture this versatility, I include a secondary and, sometimes, tertiary position variant, which lets us evaluate players' physical and athletic profiles beyond their primary role.
            For many prospects, Nick's version included multiple position designations as well. The key distinction is how I created these secondary and tertiary scores. In particular, I take a prospect's Combine data and <em>temporarily</em> insert them into the primary position dataset, for their "variant" role(s). Once their percentiles are calculated, I remove the variant from the dataset. <strong>With this "add-one-in, leave-one-out" approach</strong>, I iteratively generate Combine Scores at secondary and tertiary positions without compromising the primary position entries or influencing the scores of ensuing secondary/tertiary inputs.
          </p>
          <p className="mb-4">
            Take <strong>Zach LaVine</strong> (2014 NBA Draft), for example. His most-played NBA position is Shooting Guard (SG), so I assign that as his primary position. However, like many two guards, he's also played significant minutes at PG & SF (secondary & tertiary roles). To evaluate his point guard variant, I insert his Combine data into the primary PG dataset, deriving his percentile measurements relative to all primary point guards before removing him from the PG dataset. I repeat the same process for his SF variant, producing Combine Scores across three different positions for user browsing and accessibility.
          </p>
          <p>
            The result is that <strong>one player can have multiple, position-specific Combine Scores</strong>, giving us a complete and flexible view of their anthropic and athletic profile in various roles. Since I only temporarily insert their data to derive the variant scores, we maintain the integrity of the primary position percentiles/scores. Ultimately, this leads to an expanded database of Combine Scores, which I hope will further amplify its value and utility.
          </p>
        </div>
      )
    },
    {
      id: 'visuals',
      title: 'What visualizations are available?',
      content: (
        <div>
          <p className="mb-4">
            The Combine Score page offers several visual tools to help you understand and compare player measurements:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
            <li><strong>Combine Score Table</strong> – A comprehensive sortable table displaying all measurements (in white) and their percentiles (in color)</li>
            <li><strong>Player vs. Average Position</strong> – Direct comparison chart showing how a player's measurements stack up against positional averages</li>
            <li><strong>Anthopometric Data Spider Chart</strong> – Visual radar chart displaying a player's complete anthropometric profile</li>
            <li><strong>Athletic Testing Spider Data</strong> – Visual radar chart displaying a player's complete athletic testing profile</li>
          </ul>
          <p>
          Our visuals offer two modes of analysis. In the the default view, you see a player compared to their position's historical average. However, using the comparison search bar 
          triggers a dynamic update across the graphs, replacing positional averages with the data of a second selected player for a direct head-to-head comparison.
          </p>
        </div>
      )
    },
    {
      id: 'code-type',
      title: 'Which programming language did you use?',
      content: (
        <p>
          I developed all the score calculations and data processing in <strong>Python</strong>. The frontend (visuals, page design, interactive features) is built with <strong>HTML, CSS, TypeScript, and JavaScript (Next.js)</strong>.
        </p>
      )
    },
    {
      id: 'acknowledgements',
      title: 'Who helped you do this? (acknowledgements)',
      content: (
        <div>
          <p className="mb-4">
            First and foremost, massive thanks to <strong>Nick Kalinowski</strong> (<a href="https://x.com/kalidrafts" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">@kalidrafts on X</a>) for envisioning, building, and promoting Combine Score, enabling TPM's extension. Nick's original work set the standard for quantifying combine performance, and this continuation aims to honor that legacy.
          </p>
          <p>
            Additionally, thank you to my co-founder, <strong>Max Savin</strong> (<a href="https://x.com/supersayansavin" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">@supersayansavin</a>), for his support & guidance, especially since he's hard at work on his own draft models that leverage Combine Score data.
          </p>
        </div>
      )
    },
    {
      id: 'contact',
      title: 'Who is Bala Ravikumar and how can I contact him?',
      content: (
        <div>
          <p className="mb-4">
            I am an economics graduate from UCLA (class of 2024). I'm a co-founder of Tawny Park Metrics, responsible for all the front-end programming of the site. If you have any inquiries related to the Combine Score calculation, individual player scores/positions, or any recommendations/ideas, you can reach me at bala.ravi2002@gmail.com or <a href="https://x.com/BalaRavikumar5" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">@BalaRavikumar5</a> on X.
          </p>
          <p>
            Thanks for taking the time to check out TPM & Combine Score. We appreciate your interest.
          </p>
        </div>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-[#19191A]">
        <NavigationHeader activeTab="Combine Score" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Combine Score FAQs
          </h1>
          <p className="text-gray-300 mb-4">
            Learn about Combine Score methodology & interpretation via frequently asked questions
          </p>
          <p className="text-gray-300 mb-4">Written by Bala Ravikumar</p>
        </div>

        <div className="space-y-4">
          {sections.map((section, index) => (
            <React.Fragment key={section.id}>
              <DropdownSection
                title={section.title}
                isOpen={openSections[section.id as keyof typeof openSections]}
                onToggle={() => toggleSection(section.id)}
              >
                {section.content}
              </DropdownSection>
              {section.id === 'visuals' && (
                <div className="flex items-center my-8">
                  <div className="flex-grow h-px bg-gray-400"></div>
                  <span className="px-4 text-gray-400 text-sm font-medium tracking-wider">LOGISTICS</span>
                  <div className="flex-grow h-px bg-gray-400"></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}