"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronDown } from 'lucide-react';
import NavigationHeader from '@/components/NavigationHeader';

interface DropdownSectionProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const DropdownSection = ({ title, children, isOpen, onToggle }: DropdownSectionProps) => (
  <div className="border border-gray-700 rounded-lg bg-gray-800/50 backdrop-blur-sm">
    <button
      onClick={onToggle}
      className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-700/30 transition-colors duration-200"
    >
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      {isOpen ? (
        <ChevronDown className="h-5 w-5 text-blue-400" />
      ) : (
        <ChevronRight className="h-5 w-5 text-gray-400" />
      )}
    </button>
    {isOpen && (
      <div className="px-6 pb-6 text-gray-300 leading-relaxed">
        {children}
      </div>
    )}
  </div>
);

const TierTable = () => (
  <div className="overflow-x-auto my-4">
    <table className="w-full border-collapse border border-gray-600">
      <thead>
        <tr className="bg-gray-700">
          <th className="border border-gray-600 px-4 py-2 text-left text-white">Tier</th>
          <th className="border border-gray-600 px-4 py-2 text-left text-white">Example</th>
          <th className="border border-gray-600 px-4 py-2 text-left text-white">Grouping(s)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border border-gray-600 px-4 py-2 text-blue-300">All Time Great</td>
          <td className="border border-gray-600 px-4 py-2">Luka Dončić</td>
          <td className="border border-gray-600 px-4 py-2">Good/Decent/Rotation</td>
        </tr>
        <tr className="bg-gray-800/30">
          <td className="border border-gray-600 px-4 py-2 text-blue-300">All-NBA Caliber</td>
          <td className="border border-gray-600 px-4 py-2">Devin Booker</td>
          <td className="border border-gray-600 px-4 py-2">Good/Decent/Rotation</td>
        </tr>
        <tr>
          <td className="border border-gray-600 px-4 py-2 text-blue-300">Fringe All-Star</td>
          <td className="border border-gray-600 px-4 py-2">Jamal Murray</td>
          <td className="border border-gray-600 px-4 py-2">Good/Decent/Rotation</td>
        </tr>
        <tr className="bg-gray-800/30">
          <td className="border border-gray-600 px-4 py-2 text-blue-300">Quality Starter</td>
          <td className="border border-gray-600 px-4 py-2">Jalen Suggs</td>
          <td className="border border-gray-600 px-4 py-2">Good/Decent/Rotation</td>
        </tr>
        <tr>
          <td className="border border-gray-600 px-4 py-2 text-blue-300">Solid Rotation</td>
          <td className="border border-gray-600 px-4 py-2">Dennis Schröder</td>
          <td className="border border-gray-600 px-4 py-2">Decent/Rotation</td>
        </tr>
        <tr className="bg-gray-800/30">
          <td className="border border-gray-600 px-4 py-2 text-blue-300">Bench Reserve</td>
          <td className="border border-gray-600 px-4 py-2">Ben McLemore</td>
          <td className="border border-gray-600 px-4 py-2">Rotation</td>
        </tr>
        <tr>
          <td className="border border-gray-600 px-4 py-2 text-blue-300">Fringe NBA</td>
          <td className="border border-gray-600 px-4 py-2">Markus Howard</td>
          <td className="border border-gray-600 px-4 py-2">Fringe NBA</td>
        </tr>
      </tbody>
    </table>
  </div>
);

export default function TPMWriteUpPage() {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev: Record<string, boolean>) => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const sections = [
    {
      id: 'overview',
      title: 'What am I looking at?',
      content: (
        <div>
          <p className="mb-4">
            My "big board", developed in association with Tawny Park Metrics, analyzes NBA draft prospects via four distinct statistical outputs:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong className="text-blue-300">Expected EPM (Estimated Plus-Minus)</strong> across first five seasons in the NBA (regression)</li>
            <li><strong className="text-blue-300">Predicted "tier"</strong> broken down into seven categories, ranging from All-Time Great to Fringe-NBA Player (classification)</li>
            <li><strong className="text-blue-300">Five closest player comps</strong> to previous draft prospects (statistical similarity)</li>
            <li><strong className="text-blue-3">Profiles contextualized</strong> as position-dependent percentiles (spider charts)</li>
          </ul>
        </div>
      )
    },
    {
      id: 'rankings',
      title: 'What are your actual rankings?',
      content: (
        <p>
          If I was sharing my board with an NBA team, I would click on the "Tiers (lock)" and then select the "5Y Avg" button. In doing so, you see prospects sorted, primarily, by their predicted tier and then sorted by expected Y1-Y5 EPM within each tier. This ranking offers the most accurate view of players' long term outlook, balancing anticipated opportunity with projected performance.
        </p>
      )
    },
    {
      id: 'basketballs',
      title: 'What are the Y1 through Y5 basketballs?',
      content: (
        <div>
          <p className="mb-4">
            The basketballs represent a timeline. Clicking on each one allows you to see prospect rankings by that year. For instance, if you click on Y2, you'll see prospects ranked by expected EPM in their second season. Accordingly, if you click on "3Y Average" you'll see the Y1, Y2, and Y3 basketballs selected (prospects sorted by predicted EPM across their first three seasons).
          </p>
          <p>
            This works in tandem with the tiers filter. For example, if you click on the "Tiers" lock and then select Y4, you'll see prospects ranked by their predicted tier and then, within each tier, sorted by their expected Y4 EPM.
          </p>
        </div>
      )
    },
    {
      id: 'tiers',
      title: 'What are the tiers?',
      content: (
        <div>
          <TierTable />
          <p className="mt-4">
            While these tiers are subjective, they are closely correlated with players' EPM peaks and, if applicable, career longevity. More importantly, relative to the broader group(s) (Good/Decent/Rotation/Fringe-NBA) a player qualifies for, single tier differences (ex. Fringe All-Star vs Quality Starter) have a marginal impact on model performance.
          </p>
          <p className="mt-4">
            By tying the tiers to player comps, I try to offer a realistic idea for each prospect's range of NBA outcomes (ex. What would success in the NBA roughly look like for Ja'Kobe Walter? What kind of career impact should we expect?)
          </p>
        </div>
      )
    },
    {
      id: 'tier-prediction',
      title: 'How do you predict prospect tiers?',
      content: (
        <div>
          <p className="mb-4">
            Technically, to predict a prospect's tier, I use a position-specific multi-stage probabilistic classification model with optimized decision thresholds. Ok, so what does that mean?
          </p>
          <p className="mb-4">
            Let's start with the most intuitive part: <strong className="text-blue-300">"position-specific."</strong> Across all my statistical outputs, I've found it's best to project players as guards, wings, or bigs. This approach helps account for differences in which features are most predictive of NBA success, depending on role.
          </p>
          <p className="mb-4">
            To help address severe class imbalances, I group the seven original tiers into four broad categories: Good, Decent, Rotation, and Fringe-NBA. Initially, I use an XGBoost (Extreme Gradient Boosting) model – a supervised machine learning algorithm – to predict the probability a prospect falls into each of the original tiers.
          </p>
          <p className="mb-4">
            To determine final tier designations, I use the probability cutoffs that minimize error ("optimal decision-thresholds"). For instance, the model classifies wings with at least a 36% probability of being "Good" and a 10% chance of being "All-NBA Caliber" as All-NBA Caliber.
          </p>
          <p>
            More importantly, those decision thresholds yield an ~0.857 F1 Score (balance between precision and recall), meaning the model is both highly accurate at identifying true prospects and good at avoiding false positives.
          </p>
        </div>
      )
    },
    {
      id: 'epm',
      title: 'What even is EPM?',
      content: (
        <p>
          To learn about Estimated Plus Minus (EPM), check out the official about page on the Dunks & Threes website. I use EPM as the target variable, measure of player-performance, for my regression models since it is highly regarded amongst NBA executives and compares well to other 'all-in-one' metrics.
        </p>
      )
    },
    {
      id: 'position',
      title: 'How do you determine a prospect\'s position/role?',
      content: (
        <div>
          <p className="mb-4">
            When Brad Stevens coached the Boston Celtics, he helped popularize a shift from the traditional five positions to three: ball-handlers, wings, and bigs. Following this trend, I too designate players as guards (primary ball-handlers), wings, or bigs.
          </p>
          <p className="mb-4">
            For clear point guards, small-forwards, and centers, that's fairly straightforward. However, for shooting-guards and power forwards, where you see greater variation, I try to use a "rounding" approach. If a prospect is primarily a shooting guard, will they play secondarily as a point guard (guard) or a small forward (wing)?
          </p>
          <p>
            More often than not, this approach results in "rounding-up" (shooting guards classified as wings and power forwards classified as bigs). This yields larger training sets for position-specific models which, in turn, produces better test performance.
          </p>
        </div>
      )
    },
    {
      id: 'player-comps',
      title: 'How do you compute the player-comps (similarity scores)?',
      content: (
        <div>
          <p className="mb-4">
            To measure the statistical similarity between a draft prospect and all the NBA players in my dataset, I use Euclidean distance. Essentially, this calculates how "far apart" two players are based on their draft age, size, athleticism, and statistical production.
          </p>
          <p className="mb-4">
            I then convert the Euclidean distances into a more intuitive similarity percentage using an exponential decay function, ensuring that only truly close comparisons yield high similarity scores.
          </p>
          <p className="mb-4">
            Ultimately, this process results in player-comparisons that are more indicative of prospect-caliber than style of play. While the comps can highlight a solid range of potential NBA outcomes, they don't necessarily reveal how each prospect will reach those levels.
          </p>
          <p>
            Since my dataset only includes draft eligible players who've entered the league since 2013, the potential player comps are constrained to that subset, limiting statistical similarity only to players from the "modern" era.
          </p>
        </div>
      )
    },
    {
      id: 'skills-graphs',
      title: 'How do you produce the skills graphs?',
      content: (
        <div>
          <p className="mb-4">
            The skills graphs are a visual representation of different aspects of prospect profiles. Specifically, they include size, athleticism, defense, rebounding, scoring, passing, shooting, and efficiency. These "skills" are data values converted to 0-100 percentiles, by role.
          </p>
          <p className="mb-4">
            Therefore, the skills graphs are not comparable across different positions. For instance, while Quentin Post profiled as a 99th percentile shooter relative to all bigs in my dataset, he is not quite a 99th percentile shooter relative to all draft prospects of any position.
          </p>
          <p>
            In almost all cases, these "skills" are a compilation of multiple stats and measurements. Additionally, if applicable, each individual stat that composes these aggregate skill ratings are standardized by age and level of competition.
          </p>
        </div>
      )
    },
    {
      id: 'limitations',
      title: 'Are there any prospects you can\'t project?',
      content: (
        <p>
          Unfortunately, yes; in rare cases, model projections for certain prospects are largely uninformative. For example, last year we only had access to data for Ulrich Chomche – selected 57th in the 2024 draft – from three games in NBA Academy Africa. While Chomche showcased tons of promise in these games, a stats-based model is not the best approach for evaluating prospects with an abnormally small sample size. This extends to all prospects with severe data limitations due to league type (ex. Overtime Elite) or injury.
        </p>
      )
    },
    {
      id: 'personal-opinion',
      title: 'Why are you so high/low on _______ prospect?',
      content: (
        <div>
          <p className="mb-4">
            This is an easy one; I'm not. Or, at least, not necessarily.
          </p>
          <p className="mb-4">
            The rankings you see on my page are not a perfect reflection of my personal opinion of prospects. While there are certain instances in which my tier and/or EPM model align with my subjective view of a player, there are plenty of cases in which they differ. For instance, in the 2024 draft I felt more confident than the EPM model on Stephon Castle, Rob Dillingham, & Tyler Smith, and less so on Zach Edey, Donovan Clingan, & Devin Carter.
          </p>
          <p>
            However, if either the tier or EPM model (or their aggregate) differ dramatically from your own perspective and you would like to better understand why, reach out to me @supersayansavin on X and I can try to offer a reasonable explanation.
          </p>
        </div>
      )
    },
    {
      id: 'film',
      title: 'Do you watch tape/film?',
      content: (
        <div>
          <p className="mb-4">
            Yes, I try to watch and learn as much about each prospect – qualitatively – as I can, but it does not factor into any of my models' output (i.e. what you see on my big board).
          </p>
          <p className="mb-4">
            For one, there is already a plethora of high quality, more conventional, scouting published online. Moreover, while I've followed the NBA and college basketball my whole life, there's still a lot I have to learn.
          </p>
          <p>
            Nevertheless, I do recognize the value of "watching games." And, therefore, possibly in the future I will put out a more hybrid board that balances model output with my own opinion (objectivity with subjectivity – quantitative with qualitative).
          </p>
        </div>
      )
    },
    {
      id: 'development',
      title: 'How long did this take you to develop?',
      content: (
        <div>
          <p className="mb-4">
            I began working on the original EPM draft model two years ago and have since spent at least 1000 hours developing and iterating all that constitutes my board. If you know what you're doing, it doesn't take too much time to build a draft model. But it takes a mind-boggling amount of time to build one well.
          </p>
          <p>
            Despite my efforts, only additional time will tell if the resources I've built are all that predictive. You can't truly prove model efficacy or performance until deployment. And, naturally, as basketball evolves so should the tools you use to evaluate it.
          </p>
        </div>
      )
    },
    {
      id: 'about-max',
      title: 'Who is Max Savin and how can I contact him?',
      content: (
        <p>
          I am a business and data science graduate from NYU Stern School of Business (class of 2024) looking to tie my obsession with sports to my profession. You can reach me at mes9950@stern.nyu.edu or find me on X @supersayansavin.
        </p>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#19191A]">
      <NavigationHeader activeTab="" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Max Savin&apos;s <span className="text-blue-400">Write Up</span>
          </h1>
          <Link 
            href="/TPM_Draft_Page"
            className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors duration-200"
          >
            See the Draft Board Here
            <ChevronRight className="ml-2 h-5 w-5" />
          </Link>
        </div>

        <div className="space-y-4">
          {sections.map((section) => (
            <DropdownSection
              key={section.id}
              title={section.title}
              isOpen={openSections[section.id as keyof typeof openSections]}
              onToggle={() => toggleSection(section.id)}
            >
              {section.content}
            </DropdownSection>
          ))}
        </div>

        <div className="mt-12 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">About Tawny Park Metrics</h2>
          <p className="text-gray-300 leading-relaxed">
            Tawny Park Metrics (TPM) is a platform for thoughtful and disruptive sports analysis. The name comes from the local park we've hooped at almost all our lives. It's our way to put Tawny Park on the map. While "Metrics" implies a focus on data analysis, we are committed to offering a wide range of insights and plan to supplement our analysis with media content in the near future.
          </p>
        </div>
      </div>
    </div>
  );
}