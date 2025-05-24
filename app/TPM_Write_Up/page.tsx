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
            My &quot;big board&quot;, developed in association with Tawny Park Metrics, analyzes NBA draft prospects via four distinct statistical outputs:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Expected <a href="https://dunksandthrees.com/about/epm" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 underline">EPM</a> (Estimated Plus-Minus)</strong> across first five seasons in the NBA (regression)</li>
            <li><strong>Predicted &quot;tier&quot;</strong> broken down into seven categories, ranging from All-Time Great to Fringe-NBA Player (classification)</li>
            <li>Five closest <strong>player comps</strong> to previous draft prospects (statistical similarity)</li>
            <li>Profiles contextualized as position-dependent percentiles (<strong>spider charts</strong>)</li>
          </ul>
        </div>
      )
    },
    {
      id: 'rankings',
      title: 'What are your actual rankings?',
      content: (
        <p>
          If I was sharing my board with an NBA team, I would click on the <strong className = "text-white">&quot;Tiers (lock)&quot; and then select the &quot;5Y Avg&quot; button.</strong> In doing so, you see prospects sorted, primarily, by their predicted tier and then sorted by expected Y1-Y5 EPM within each tier. This ranking offers the <strong>most accurate view of players&apos; long term outlook, balancing anticipated opportunity with projected performance.</strong>
        </p>
      )
    },
    {
      id: 'basketballs',
      title: 'What are the Y1 through Y5 basketballs?',
      content: (
        <div>
          <p className="mb-4">
            The basketballs represent a <strong>timeline.</strong> Clicking on each one <strong>allows you to see prospect rankings by that year.</strong> For instance, if you click on Y2, you&apos;ll see prospects ranked by expected EPM in their second season. Accordingly, if you click on &quot;3Y Average&quot; you&apos;ll see the Y1, Y2, and Y3 basketballs selected (prospects sorted by predicted EPM across their first three seasons).
          </p>
          <p>
            This works in tandem with the tiers filter. For example, if you click on the &quot;Tiers&quot; lock and then select Y4, you&apos;ll see prospects ranked by their predicted tier and then, within each tier, sorted by their expected Y4 EPM.
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
            While these tiers are subjective, they are closely correlated with players&apos; EPM peaks and, if applicable, career longevity. More importantly, relative to the broader group(s) (Good/Decent/Rotation/Fringe-NBA) a player qualifies for, single tier differences (ex. Fringe All-Star vs Quality Starter) have a marginal impact on model performance.
          </p>
          <p className="mt-4">
            <strong>By tying the tiers to player comps, I try to offer a realistic idea for each prospect&apos;s range of NBA outcomes</strong> (ex. What would success in the NBA roughly look like for Ja&apos;Kobe Walter? What kind of career impact should we expect?)
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
            Technically, to predict a prospect&apos;s tier, I use <strong>a position-specific multi-stage probabilistic classification model with optimized decision thresholds.</strong> Ok, so what does that mean?
          </p>
          <p className="mb-4">
            Let&apos;s start with the most intuitive part: &quot;position-specific.&quot; <strong>Across all my statistical outputs, I&apos;ve found it&apos;s best to project players as guards, wings, or bigs.</strong> This approach helps account for differences in which features are most predictive of NBA success, depending on role.
          </p>
          <p className="mb-4">
            To help address severe class imbalances, I group the seven original tiers into four broad categories: Good, Decent, Rotation, and Fringe-NBA. Here&apos;s the breakdown (vizualized in <strong>&quot;What are the tiers?&quot;</strong>).
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Any players in my training set who belong to the All-Time Great, All-NBA Caliber, Fringe All-Star, or Quality Starter tiers qualify for the &quot;Good&quot; category (they are, at least, good).</li>
            <li>Any players who are part of the Good category also qualify for the &quot;Decent&quot; category, along with players who belong to the Solid Rotation tier (they are, at least, decent).</li>
            <li>Any players who are part of the Decent category also qualify for the &quot;Rotation&quot; category, along with players who belong to the Bench Reserve tier (they are, at least, rotation players). </li>
            <li>Finally, players who belong to the Fringe NBA tier stay in their own category (they are not rotation players).</li>
           </ul> 
          </p>
          <p className="mb-4">
            Initially, I use an XGBoost (Extreme Gradient Boosting) model – a supervised machine learning algorithm – to predict the <strong>probability</strong> a prospect falls into each of the original tiers, (All-NBA, Fringe All-Star, Quality Starter, etc.). The XGBoost model is trained/tested using five fold cross-validation and its parameters are optimized through Randomized Search.
          </p>
          <p className="mb-4">
            I then derive additional probabilities for the four broader tier groupings: Good, Decent, and Rotation (Fringe-NBA remains the same, of course). For instance, a player’s probability of being ‘Good’ is simply the sum of their probabilities for ‘All-Time Great,’ ‘All-NBA,’ ‘Fringe All-Star,’ and ‘Quality Starter.’ I find combining these results with the original tier probabilities, ultimately, best informs the final classification decisions. This combined approach of granular and aggregate probabilities forms the <strong>‘multi-stage’</strong> aspect of the probabilistic classifier. 
          </p>
          <p className='mb-4'>
            Notably, the XGBoost model results in a valuable intermediary output: the <strong>probability distribution of different player outcomes for each prospect</strong> – offering a view of risk versus reward. It’s like considering the floor/ceiling of prospects if you knew, roughly, how likely they were to reach that ceiling or fall to that floor. In future work, I will try to display these probabilities on the site as well.
          </p>
          <p className="mb-4">
            To determine final tier designations, I use the probability cutoffs that minimize error (&quot;optimal decision-thresholds&quot;). For instance, the model classifies wings with at least a 36% probability of being &quot;Good&quot; and a 10% chance of being &quot;All-NBA Caliber&quot; as All-NBA Caliber. While classifying a player as &quot;All-NBA Caliber&quot; when they supposedly only have a 10% chance seems counterintuitive, the probabilities are all relative. A 10% probability of being an &quot;All-NBA Caliber&quot; player is relatively high for wing prospects. 
          </p>
          <p>
            More importantly, those decision thresholds yield an ~ 0.857<strong> F1 Score</strong> (balance between precision and recall). In other words, the model is both highly accurate at identifying true All-NBA Caliber wing prospects (high recall) and good at avoiding false positives (high precision), meaning that when it predicts a wing will be All-NBA Caliber player, they are likely to actually reach that level in the NBA.
          </p>
        </div>
      )
    },
    {
      id: 'tier-projection',
      title: 'How accurate are your tier projections?',
      content: (
        <p>
          The <strong>average F1 Score for each tier-position pair is ~ 0.72.</strong> Overall, that performance is relatively promising for a classification task of this difficulty and complexity. However, the classification model <strong>performs better towards the extremes or ends, compared to the middle tiers.</strong> Correspondingly, the model is also better at differentiating between the broader tier groupings than the original granular tiers. In particular, the model <strong>does well identifying Good vs Rotation vs Fringe NBA</strong> caliber prospects, but is <strong>worse at distinguishing between Solid Rotation and Bench Reserve players.</strong>
        </p>
      )
    },
    {
      id: 'tier-limitations',
      title: 'What are the limitations or weaknesses of your tiers model?',
      content: (
        <p>
        As mentioned in &quot;How accurate are your tier projections?&quot;, the classification model is <strong>less adept at differentiating between adjacent tiers.</strong> Specifically, the model performs worst when trying to classify bigs as &quot;Solid Rotation&quot; vs &quot;Bench Reserve.&quot; In future work, I’ll look to refine the tier definitions and explore alternative or ensemble classification algorithms (currently, XGBoost) to improve general predictive power and address position-tier performance deviations (ex. falloff when classifying bigs as “Solid Rotation” vs “Bench Reserve”).        </p>
      )
    },
    {
      id: 'epm',
      title: 'What even is EPM?',
      content: (
        <p>
          To learn about Estimated Plus Minus (EPM), check out the official <a href="https://dunksandthrees.com/about/epm" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-200 underline">about</a> page on the Dunks & Threes website. I use EPM as the target variable, measure of player-performance, for my regression models since it is <a href="https://hoopshype.com/lists/advanced-stats-nba-real-plus-minus-rapm-win-shares-analytics/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-200 underline">highly regarded amongst NBA executives</a> and <a href="https://dunksandthrees.com/blog/metric-comparison" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-200 underline">compares well to other &apos;all-in-one&apos; metrics.</a>
        </p>
      )
    },
    {
      id: 'predict-epm',
      title: 'How do you predict EPM?',
      content: (
        <div>
        <p className="mb-4">
          After standardizing my dataset by both age and level of competition, I then normalize features (predictor variables) into z-scores. With my data both standardized and normalized, I train and test the <strong>15 ensemble models</strong> that make up my EPM projections.
        </p>
        <p className="mb-4">
          Ok, so what are these ensemble models and why fifteen of them? To start, the EPM models are position-specific (different models for guards, wings, and bigs). Within those three position groups, I <strong>predict EPM production for each draft prospect’s first five seasons in the NBA</strong> (the Y1-Y5 basketballs timeline). For any mathematicians out there who can follow, three times five equals fifteen. Better put, I output EPM model predictions for fifteen position-year subsets (rookie year guards through fifth year bigs). The 3Y and 5Y averages displayed on my board are, intuitively, the average and concatenate of those position-year subsets.
        </p>
        <p>
          But why though? Logically, it would be simpler to use three ensemble models (one for each position group) that directly predicts average EPM. However, when I initially began developing a draft model that predicts EPM (to my knowledge, <strong>the first in the public sphere</strong>) I was attracted to the idea of tracking prospects’ year-over-year development in the NBA. Using my individual year EPM predictions, an NBA team could, in theory, understand how a <strong>recently drafted player is progressing relative to their expected EPM production.</strong> Hence, the hope is not only that my EPM model would help better inform draft decisions, but also player development.
        </p>
        </div>
      )
    },
    {
      id: 'position',
      title: "How do you determine a prospect's position/role?",
      content: (
        <div>
          <p className="mb-4">
            When Brad Stephens coached the Boston Celtics, he helped popularize a shift from the traditional five positions to three: <a href="http://basketballgrowthmindset.com/brad-stevens-3-position-lineup-philosophy/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-200 underline">ball-handlers, wings, and bigs.</a> While that framework isn’t perfect, it does better align with a game that is increasingly “positionless.” Unlike other sports, basketball players don’t always occupy a predetermined spot or role – there’s no perfect equivalent to playing, for example, catcher in baseball or tight end in football. Inevitably, that makes designations for position-specific projections difficult and unstandardized. Two scouts can, reasonably, each project the same prospect to play different positions in the NBA.
          </p>
          <p className="mb-4">
            Following the trend, I too designate players as guards (primary ball-handlers), wings, or bigs. For clear point guards, small-forwards, and centers, that’s fairly straightforward. However, for shooting-guards and power forwards, where you see greater variation, I try to use a “rounding” approach. <strong>If a prospect is primarily a shooting guard, will they play secondarily as (i.e. are they closer to) a point guard (guard) or a small forward (wing)? Similarly, if a prospect is primarily a power forward, will they play secondarily as (i.e. are they closer to) a small forward (wing) or a center (big)?</strong> More often than not, this approach results in “rounding-up” (shooting guards classified as wings and power forwards classified as bigs). 
          </p>
          <p className="mb-4">
            While, by now, this is a widespread concept, I find it’s still worth reiterating. Moreover, <strong>designating prospects as guards, wings, and bigs (rather than 1-5) yields larger training sets for position-specific models which, in turn, produces better test performance.</strong> Generally, the more data you can use to train your model the better it will predict.
          </p>
          <p className="mb-4">
            However, if there is a specific prospect who’s position designation you disagree with, feel free to reach out to me, and I will do my best to let you know how they project in an alternative role.
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
          To measure the statistical similarity between a draft prospect and all the NBA players in my dataset, I use <strong>Euclidean distance.</strong> Essentially, this calculates how “far apart” two players are based on their draft age, size, athleticism, and statistical production. I then convert the Euclidean distancesinto a more intuitive similarity percentage using an <strong>exponential decay</strong> function, ensuring that only truly close comparisons yield high similarity scores. For any data scientists or statisticians, I tested player-comps with Cosine similarity as well, but found the magnitude similarity in draft profiles more insightful than similarity in patterns or proportions.
          </p>
          <p className="mb-4">
            Ultimately, this process results in player-comparisons that are <strong>more indicative of prospect-caliber than style of play.</strong> While the comps can highlight a solid range of potential NBA outcomes, they don’t necessarily reveal how each prospect will reach those levels. Take Stephon Castle, for example, who’s most favorable player comp was Tyrese Maxey. While they bear some similarity as prospects and Maxey could represent a high percentile outcome, it doesn’t ensure that Castle will play the same way as Maxey (i.e. Stephon could end up a similar caliber guard, but with noticeably different tendencies).
          </p>
          <p className="mb-4">
            Frankly, I find the traditional “style of play” comps more intriguing (ex. who will Donovan Clingan’s NBA game mirror?). However, those typically lend themselves better to a more film-reliant approach (ex. who does Clingan remind you of when you watch him at UConn). Whereas, data helps discern just how similar a draft prospect is to a possible NBA comp. (ex. about how similar is Clingan to, say, Walker Kessler?). In future work, I’ll consider pairing these two concepts – style of play comps contextualized using percentage similarity.
          </p>
          <p className="mb-4">
            Since my dataset only includes draft eligible players who’ve entered the league since 2013, the potential player comps are constrained to that subset. Rather than offering historic comparisons from all players in NBA history, my board limits <strong>statistical similarity only to players from the &quot;modern&quot; era,</strong> credited as <a href="https://statds.org/events/ucsas2020/posters/ucsas-4-UCSAS_Poster_-_Joao_Vitor_Rocha_da_Silva_and_Paulo_Canas_Rodrigues.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-200 underline">originating around the 2013-14 season.</a>
          </p>
          <p className="mb-4">
          For further context, this era is often characterized by terms such as &quot;pace and space,&quot; high or constant &quot;motion,&quot; and &quot;small ball.&quot; Predominantly, this period was pioneered by the 2011-2014 Miami Heat, inspired by the 2004-2007 &quot;seven seconds or less&quot; Phoenix Suns, and evolved by the 2015-2019 Golden State Warriors.
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
            The skills graphs are a visual representation of different aspects of prospect profiles. Specifically, they include size, athleticism, defense, rebounding, scoring, passing, shooting, and efficiency. These “skills” are <strong>data values converted to 0-100 percentiles,</strong> by role. 
          </p>
          <p className="mb-4">
            Therefore, the skills graphs are <strong>not comparable across different positions.</strong> For instance, while Quentin Post profiled as a 99th percentile shooter relative to all bigs in my dataset, he is not quite a 99th percentile shooter relative to all draft prospects of any position. Similarly, while Tyler Smith profiled as a 28th percentile big in size, at 6'9" without shoes, he’s obviously better than 28th percentile in size relative to all draft prospects of any position.
          </p>
          <p className="mb-4">
            In almost all cases, these &quot;skills&quot; are a compilation of multiple stats and measurements. Additionally, <strong>if applicable, each individual stat that composes these aggregate skill ratings are standardized by age and level of competition.</strong>
          </p>
          <p className="mb-4">
            Unlike the supervised prospect tiers and EPM models, <strong>the skills graphs and player comparisons are exploratory</strong> analysis (rather than predictive). Their purpose is more to help understand prospects than to rank or evaluate them.
          </p>
        </div>
      )
    },
    {
      id: 'limitations',
      title: "Are there any prospects you can't project?",
      content: (
        <p>
          Unfortunately, <strong>yes; in rare cases, model projections for certain prospects are largely uninformative.</strong> For example, last year we only had access to data for Ulrich Chomche – selected 57th in the 2024 draft – from three games in NBA Academy Africa. While Chomche showcased tons of promise in these games, <strong>a stats-based model is not the best approach for evaluating prospects with an abnormally small sample size.</strong> This extends to all prospects with severe data limitations due to league type (ex. Overtime Elite) or injury (ex. Michael Porter Jr.).
        </p>
      )
    },
    {
      id: 'data-use',
      title: 'Can I see your data and use it for my own analysis?',
      content: (
        <div>
          <p className="mb-4">
            <strong>Hopefully in the near future, yes.</strong> We would like to offer access to the data I use for my models (except the EPM data, which is not mine to share) as part of an upcoming subscription service. In doing so, subscribers could pursue their own draft analysis without having to source, standardize, and clean the data themselves – often the most time-intensive and tedious part of the data science process. Specifically, this will include access to the international and g-league BPM’s I’ve calculated, features I’ve engineered, a &quot;raw&quot; copy of the dataset, and a copy standardized by both age and strength of competition.
          </p>
          <p className="mb-4">
            Ideally, should Tawny Park Metrics achieve financial viability from other sources of revenue, we would eventually offer the data for free. However, for the foreseeable future, it will remain behind a paywall, enabling us to continue producing basketball analysis and content.
          </p>
          </div>
      )
    },
    {
      id: 'personal-opinion',
      title: 'Why are you so high/low on _______ prospect?',
      content: (
        <div>
          <p className="mb-4">
            This is an easy one; I&apos;m not. Or, at least, not necessarily.
          </p>
          <p className="mb-4">
            <strong>The rankings you see on my page are not a perfect reflection of my personal opinion of prospects.</strong> While there are certain instances in which my tier and/or EPM model align with my subjective view of a player, there are plenty of cases in which they differ. For instance, in the 2024 draft I felt more confident than the EPM model on Stephon Castle, Rob Dillingham, & Tyler Smith, and less so on Zach Edey, Donovan Clingan, & Devin Carter.
          </p>
          <p className="mb-4">
            However, if either the tier or EPM model (or their aggregate) differ dramatically from your own perspective and you would like to better understand why, reach out to me <a href="https://x.com/supersayansavin" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-200 underline">@supersayansavin on X</a> and I can try to offer a reasonable explanation. <strong>The skills graphs</strong> (spider charts), in particular, can also <strong>help reveal where my data might be under/over-rating a prospect’s skill set</strong> relative to general consensus.
          </p>
          <p className="mb-4">
            <strong>In future work, I hope to add a write-up to each prospect card that will help contextualize model results,</strong> addressing the reasoning behind a projection and ways it could be wrong.
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
            <strong>Yes,</strong> I try to watch and learn as much about each prospect – qualitatively – as I can, <strong>but it does not factor into any of my models’ output</strong> (i.e. what you see on my big board). While I love watching college, international, g-league, and NBA hoops, I don’t, yet, feel compelled to publish my own personal opinion on prospects. 
          </p>
          <p className="mb-4">
            For one, there is already a plethora of high quality, more conventional, scouting published online. Moreover, while I’ve followed the NBA and college basketball my whole life, <strong>there’s still a lot I have to learn.</strong> It’s remarkable how much transpires possession to possession, that if you’re not watching closely, completely flies over your head. 
          </p>
          <p className="mb-4">
            Nevertheless, I do recognize the value of &quot;watching games.&quot; And, therefore, possibly in the future I will put out a more hybrid board that balances model output with my own opinion (objectivity with subjectivity – quantitative with qualitative).
          </p>
          <p className="mb-4">
            Certainly, <strong>I encourage you <a className="underline">not</a> to take my pure-model board as definitive and, instead, simply consider where it differs/aligns with your own perspective and – more importantly – why.</strong> Additionally, if model or “stats-heavy” draft boards are just not for you, I can respect that; we are actively looking to add more qualitative (film-reliant) draft boards to the site as well.
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
            I began working on the original EPM draft model two years ago and have since spent at least <strong>1000 hours</strong>1 developing and iterating all that constitutes my board. If you know what you&apos;re doing, it doesn&apos;t take too much time to build a draft model. But it takes a mind-boggling amount of time to build one well.
          </p>
          <p className="mb-4">
            Despite my efforts, only additional time will tell if the resources I&apos;ve built are all that predictive. You can&apos;t truly prove model efficacy or performance until deployment. And, naturally, as basketball evolves so should the tools you use to evaluate it. With that in mind, I expect to always be developing and iterating my approach to the draft, including statistical models, for as long as I can.
          </p>
        </div>
      )
    },
    {
      id: 'about-bala',
      title: 'Why does your board look so nice visually?',
      content: (
        <p className="mb-4">
          The one-and-only, <strong>Bala Ravikumar</strong> is responsible for programming all the visually striking draft boards across the site, including my own. We have worked extensively together to “get the design right” and iron out small details, leading to draft boards that we hope you will enjoy browsing. Please let us know if you have any design feedback or suggestions. While we are pleased with the current look of the site, we’re always trying to make improvements.
        </p>
      )
    },
    {
    id: 'about-help',
    title: 'Who helped you do this? (acknowledgements)',
    content: (
      <div>
      <p className="mb-4">
        As detailed in &quot;Why does your draft board look so nice visually?&quot;, <strong>Bala Ravikumar </strong>has made a remarkable effort to bring my draft board and analysis to life. Furthermore, as my fellow co-founder of Tawny Park Metrics (TPM), he is imperative to all the work we do, soon extending beyond NBA Draft content. Many thanks to <strong>Seena Pourzand</strong> and <strong>Thomas Barbounis</strong> for their feedback and help with TPM as well.
      </p>
      <p className="mb-4">
        Notably, much of my work would not be possible without the tremendous work of other data scientists. Foremost, <strong>Nick Kalinowski</strong> (<a href="https://x.com/kalidrafts?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-200 underline">@kalidrafts on X</a>) not only provides the Combine Score metric I use in virtually all my analysis, but also is an incredible resource for help and guidance. We are extremely grateful to host his draft model board on the site. 
      </p>
      <p className="mb-4">
        Moreover, my models heavily rely on the work of <strong>Taylor Snarr,</strong> the creator of EPM and formerly with the Utah Jazz, and <strong>Layne Varsho,</strong> who published his research on <a href="https://fansided.com/2015/11/06/deep-dives-measuring-level-of-competition-around-the-world/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-200 underline">how production from leagues around the world translates to the NBA,</a> currently with the Denver Nuggets.  
      </p>
      <p className="mb-4">
        Thank you to <strong>Mike Gribanov</strong> (<a href="https://x.com/mikegrib8?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-200 underline">@mikegrib8 on X</a>) for his feedback and input, as well as all the members of the NBA draft group chat he added me to (ifykyk). It’s hard not to learn more about basketball when you’re spammed with hundreds of messages a day about the sport. 
      </p>
      <p className="mb-4">
        Lastly, thanks to <strong>Josh Lloyd</strong> (<a href="https://x.com/redrock_bball?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-200 underline">@redrock_bball on X</a>) who’s draft content first inspired me to pursue my own.
      </p>

      </div>
    )
    },
    {
      id: 'about-max',
      title: 'Who is Max Savin and how can I contact him?',
      content: (
        <p>
          I am a business and data science graduate from NYU Stern School of Business (class of 2024) looking to tie my obsession with sports to my profession. You can reach me at<a href="mes9950@stern.nyu.edu" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-200 underline"> mes9950@stern.nyu.edu</a> or find me on X <a href="https://x.com/supersayansavin" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-200 underline">@supersayansavin</a>.
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
            FAQs
          </h1>
          <p className="text-gray-300 mb-4">Learn about my draft model & analysis via frequently asked questions</p>
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
      </div>
    </div>
  );
}