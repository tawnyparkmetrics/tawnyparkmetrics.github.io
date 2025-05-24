"use client";
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import NavigationHeader from '@/components/NavigationHeader';

interface DropdownSectionProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const tierColors: { [key: string]: string } = {
  'All-Time Great': '#FF66C4',
  'All-NBA Caliber': '#E9A2FF',
  'Fringe All-Star': '#5CE1E6',
  'Quality Starter': '#7ED957',
  'Solid Rotation': '#FFDE59',
  'Bench Reserve': '#FFA455',
  'Fringe NBA': '#FF5757',
};

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

const TierTable = () => (
  <div className="overflow-x-auto my-4">
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-700">
          <th className="border border-gray-600 px-4 py-2 text-left text-white">Tier</th>
          <th className="border border-gray-600 px-4 py-2 text-left text-white">Example</th>
          <th className="border border-gray-600 px-4 py-2 text-left text-white">Grouping(s)</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(tierColors).map(([tier, color], index) => (
          <tr key={tier} className={index % 2 === 0 ? '' : 'bg-gray-800/30'}>
            <td className="border border-gray-600 px-4 py-2">
              <div 
                className="inline-block px-3 py-1 rounded"
                style={{
                  color: color,
                  border: `1px solid ${color}`,
                  backgroundColor: `${color}30` // 30 is hex for 0.3 opacity
                }}
              >
                {tier}
              </div>
            </td>
            <td className="border border-gray-600 px-4 py-2 text-white">
              {tier === 'All-Time Great' ? 'Luka Dončić' :
               tier === 'All-NBA Caliber' ? 'Devin Booker' :
               tier === 'Fringe All-Star' ? 'Jamal Murray' :
               tier === 'Quality Starter' ? 'Jalen Suggs' :
               tier === 'Solid Rotation' ? 'Dennis Schröder' :
               tier === 'Bench Reserve' ? 'Ben McLemore' :
               'Markus Howard'}
            </td>
            <td className="border border-gray-600 px-4 py-2 text-white">
              {tier === 'Fringe NBA' ? 'Fringe NBA' :
               tier === 'Bench Reserve' ? 'Rotation' :
               tier === 'Solid Rotation' ? 'Decent/Rotation' :
               'Good/Decent/Rotation'}
            </td>
          </tr>
        ))}
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
            <strong>By tying the tiers to player comps, I try to offer a realistic idea for each prospect&apos;s range of NBA outcomes</strong> (ex. What would success in the NBA roughly look like for Ja&apos;Kobe Walter? What kind of career impact should we expect?).
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
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Any players in my training set who belong to the All-Time Great, All-NBA Caliber, Fringe All-Star, or Quality Starter tiers qualify for the &quot;Good&quot; category (they are, at least, good).</li>
            <li>Any players who are part of the Good category also qualify for the &quot;Decent&quot; category, along with players who belong to the Solid Rotation tier (they are, at least, decent).</li>
            <li>Any players who are part of the Decent category also qualify for the &quot;Rotation&quot; category, along with players who belong to the Bench Reserve tier (they are, at least, rotation players). </li>
            <li>Finally, players who belong to the Fringe NBA tier stay in their own category (they are not rotation players).</li>
           </ul> 
          <p className="mb-4"> </p>
          <p className="mb-4">
            Initially, I use an XGBoost (Extreme Gradient Boosting) model – a supervised machine learning algorithm – to predict the <strong>probability</strong> a prospect falls into each of the original tiers, (All-NBA, Fringe All-Star, Quality Starter, etc.). The XGBoost model is trained/tested using five fold cross-validation and its parameters are optimized through Randomized Search.
          </p>
          <p className="mb-4">
            I then derive additional probabilities for the four broader tier groupings: Good, Decent, and Rotation (Fringe-NBA remains the same, of course). For instance, a player&apos;s probability of being &quot;Good&quot; is simply the sum of their probabilities for &quot;All-Time Great,&quot; &quot;All-NBA,&quot; &quot;Fringe All-Star,&quot; and &quot;Quality Starter.&quot; I find combining these results with the original tier probabilities, ultimately, best informs the final classification decisions. This combined approach of granular and aggregate probabilities forms the <strong>&apos;multi-stage&apos;</strong> aspect of the probabilistic classifier. 
          </p>
          <p className='mb-4'>
            Notably, the XGBoost model results in a valuable intermediary output: the <strong>probability distribution of different player outcomes for each prospect</strong> – offering a view of risk versus reward. It&apos;s like considering the floor/ceiling of prospects if you knew, roughly, how likely they were to reach that ceiling or fall to that floor. In future work, I will try to display these probabilities on the site as well.
          </p>
          <p className="mb-4">
            To determine final tier designations, I use the probability cutoffs that minimize error (&quot;optimal decision-thresholds&quot;). For instance, the model classifies wings with at least a 36% probability of being &quot;Good&quot; and a 10% chance of being &quot;All-NBA Caliber&quot; as All-NBA Caliber. While classifying a player as &quot;All-NBA Caliber&quot; when they supposedly only have a 10% chance seems counterintuitive, the probabilities are all relative. A 10% probability of being an &quot;All-NBA Caliber&quot; player is relatively high for wing prospects. 
          </p>
          <p className="mb-4">
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
          As mentioned in &quot;How accurate are your tier projections?&quot;, the classification model is <strong>less adept at differentiating between adjacent tiers.</strong> Specifically, the model performs worst when trying to classify bigs as &quot;Solid Rotation&quot; vs &quot;Bench Reserve.&quot; In future work, I&apos;ll look to refine the tier definitions and explore alternative or ensemble classification algorithms (currently, XGBoost) to improve general predictive power and address position-tier performance deviations (ex. falloff when classifying bigs as &quot;Solid Rotation&quot; vs &quot;Bench Reserve&quot;).      
        </p>
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
          Ok, so what are these ensemble models and why fifteen of them? To start, the EPM models are position-specific (different models for guards, wings, and bigs). Within those three position groups, I <strong>predict EPM production for each draft prospect&apos;s first five seasons in the NBA</strong> (the Y1-Y5 basketballs timeline). For any mathematicians out there who can follow, three times five equals fifteen. Better put, I output EPM model predictions for fifteen position-year subsets (rookie year guards through fifth year bigs). The 3Y and 5Y averages displayed on my board are, intuitively, the average and concatenate of those position-year subsets.
        </p>
        <p className="mb-4">
          But why though? Logically, it would be simpler to use three ensemble models (one for each position group) that directly predicts average EPM. However, when I initially began developing a draft model that predicts EPM (to my knowledge, <strong>the first in the public sphere</strong>) I was attracted to the idea of tracking prospects&apos; year-over-year development in the NBA. Using my individual year EPM predictions, an NBA team could, in theory, understand how a <strong>recently drafted player is progressing relative to their expected EPM production.</strong> Hence, the hope is not only that my EPM model would help better inform draft decisions, but also player development and rookie extension; I am actively exploring the best way to tie a second contract projection to the EPM model in the near future.
        </p>
        <p className="mb-4">
          What individual models make up the ensembles? <strong>The ensembles are each composed of up to five different machine learning models, three non-linear – a random forest regressor, an XGBoost regressor, and an MLP regressor (neural network) – and two linear – ridge regression and support vector regression (svr).</strong> Each of these models is trained with optimal hyperparameters discovered via Randomized Search, tested using five-fold cross-validation, and analyzed through feature importance and learning curves. Therefore, in total, I train, test, and analyze 75 models (five individual models times each of the fifteen ensembles) to produce my EPM predictions. However, the way an ensemble works, is you take the weighted average of multiple model predictions to land at final, typically more accurate, output. In practice, not all five individual models always contribute to the final EPM ensemble, as any that don&apos;t improve predictive performance are omitted.
        </p>
        <p className="mb-4">
          Note, in part, I predict EPM across a prospect&apos;s first five seasons since the average NBA career lasts 4.5 years. However, since first-round draft picks sign four-year rookie-scale contracts, it potentially makes sense to switch to only four year projections in future work. If you&apos;re interested in a draft model that predicts average EPM directly across the duration of a prospects four year rookie contract, I highly recommend checking out <a href="https://tawnyparkmetrics.com/Nick_Draft_Page" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-200 underline">Nick Kalinowski&apos;s big board.</a>
        </p>
        </div>
      )
    },
    {
      id: 'accurate-epm',
      title: 'How accurate are your EPM projections? (more coming soon)',
      content: (
        <div>
        <p className="mb-4">
          Predicting exact NBA EPM performance, using only data available before the draft, is extremely difficult. Across the fifteen position-year subsets, the <strong>models can typically predict EPM with an RMSE between 1.5 and 2</strong> (for reference, the &quot;real-life&quot; average NBA EPM is around -1 and generally varies from -7 to 9 each season). Naturally, the models are better at predicting EPM earlier in a player&apos;s career (when the overall variation is smaller). Going forward, I will simply refer to a singular &quot;EPM model&quot; or &quot;the model&quot;; for clarity, this is the aggregate of the fifteen position-year subset ensemble models and their predictions.
        </p>
        <p className="mb-4">
          All things considered, the model&apos;s EPM predictive performance is only fair (valuable but far from perfect). The order in which the model ranks prospects, by predicted EPM, is far more impressive. I am working on a test and accompanying graphic that illustrates model performance vs the NBA in recent draft classes. This will compare the correlation between player EPM performance and their draft position (ex. prospect was selected eleventh) against the correlation between their EPM performance and the model&apos;s predicted EPM rank (ex. model ranked the prospect 8th best in the class). 
        </p>
        <p className="mb-4">
          Furthermore, I will also indicate the predictive power of the combined tier and EPM model outputs. This will highlight how the model performs when prospects are ranked primarily by their predicted tier, and then ordered by their projected EPM within each tier – identical to the joint &quot;Tiers [lock]&quot; and &quot;5Y Avg&quot; view on my board.
        </p>
        </div>
      )
    },
    {
      id: 'weakness-epm',
      title: 'What are the limitations or weaknesses of your EPM model?',
      content: (
        <div>
        <p className="mb-4">
          As mentioned in &quot;How accurate are your EPM projections?&quot;, <strong>the order in which the EPM model ranks prospects is generally more insightful than the exact predicted EPM values.</strong> Moreover, I&apos;ve also found that EPM rankings within position groups are more predictive than the model&apos;s overall aggregate rankings across all positions. Put simply, the EPM model is <strong>better suited for comparing players of the same position than ranking players from different positions against each other.</strong> In part, that&apos;s why I include position-specific EPM rankings on my draft board (not just &quot;Overall&quot; EPM rankings).
        </p>
        <p className="mb-4">
          Another clear flaw is that the EPM model <strong>relies on the assumption that all draft prospects will make it, at least, five years in the NBA.</strong> This goes hand in hand with the model&apos;s positional biases. For instance, the model tends to overvalue bigs in year four and year five. To its credit, big-men who reach their fifth season, on average, tend to outperform fifth-year guards and wings in EPM. However, in reality, a high number of players drafted each year, including bigs, fail to last five seasons in the NBA.
        </p>
        <p className="mb-4">
          Fortunately, the predictable nature of the model&apos;s errors makes them easier to account for when interpreting its results. Additionally, <strong>in many ways, the tiers model helps account for the EPM model&apos;s weaknesses.</strong> In particular, the tiers model exhibits minimal positional bias and, since it is influenced more heavily by consensus, tends to better account for differences in anticipated opportunity. Therefore, the tiers and EPM models complement each other well, proving more predictive together than when interpreted separately. 
        </p>
        <p className="mb-4">
          I also recognize that a myriad of factors, both quantitative and qualitative, factor into NBA teams&apos; draft processes and NBA player outcomes. Thus, I developed all my draft analysis, especially the EPM model, with the intention of informing better draft decisions, rather than outsourcing them to an algorithm. In other words, <strong>my work is not intended to replace existing models and scouting practices but rather to supplement them.</strong>
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
            When Brad Stephens coached the Boston Celtics, he helped popularize a shift from the traditional five positions to three: <a href="http://basketballgrowthmindset.com/brad-stevens-3-position-lineup-philosophy/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-200 underline">ball-handlers, wings, and bigs.</a> While that framework isn&apos;t perfect, it does better align with a game that is increasingly &quot;positionless.&quot; Unlike other sports, basketball players don&apos;t always occupy a predetermined spot or role – there&apos;s no perfect equivalent to playing, for example, catcher in baseball or tight end in football. Inevitably, that makes designations for position-specific projections difficult and unstandardized. Two scouts can, reasonably, each project the same prospect to play different positions in the NBA.
          </p>
          <p className="mb-4">
            Following the trend, I too designate players as guards (primary ball-handlers), wings, or bigs. For clear point guards, small-forwards, and centers, that&apos;s fairly straightforward. However, for shooting-guards and power forwards, where you see greater variation, I try to use a &quot;rounding&quot; approach. <strong>If a prospect is primarily a shooting guard, will they play secondarily as (i.e. are they closer to) a point guard (guard) or a small forward (wing)? Similarly, if a prospect is primarily a power forward, will they play secondarily as (i.e. are they closer to) a small forward (wing) or a center (big)?</strong> More often than not, this approach results in &quot;rounding-up&quot; (shooting guards classified as wings and power forwards classified as bigs). 
          </p>
          <p className="mb-4">
            While, by now, this is a widespread concept, I find it&apos;s still worth reiterating. Moreover, <strong>designating prospects as guards, wings, and bigs (rather than 1-5) yields larger training sets for position-specific models which, in turn, produces better test performance.</strong> Generally, the more data you can use to train your model the better it will predict.
          </p>
          <p className="mb-4">
            However, if there is a specific prospect who&apos;s position designation you disagree with, feel free to reach out to me, and I will do my best to let you know how they project in an alternative role.
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
            To measure the statistical similarity between a draft prospect and all the NBA players in my dataset, I use <strong>Euclidean distance.</strong> Essentially, this calculates how &quot;far apart&quot; two players are based on their draft age, size, athleticism, and statistical production. I then convert the Euclidean distancesinto a more intuitive similarity percentage using an <strong>exponential decay</strong> function, ensuring that only truly close comparisons yield high similarity scores. For any data scientists or statisticians, I tested player-comps with Cosine similarity as well, but found the magnitude similarity in draft profiles more insightful than similarity in patterns or proportions.
          </p>
          <p className="mb-4">
            Ultimately, this process results in player-comparisons that are <strong>more indicative of prospect-caliber than style of play.</strong> While the comps can highlight a solid range of potential NBA outcomes, they don&apos;t necessarily reveal how each prospect will reach those levels. Take Stephon Castle, for example, who&apos;s most favorable player comp was Tyrese Maxey. While they bear some similarity as prospects and Maxey could represent a high percentile outcome, it doesn&apos;t ensure that Castle will play the same way as Maxey (i.e. Stephon could end up a similar caliber guard, but with noticeably different tendencies).
          </p>
          <p className="mb-4">
            Frankly, I find the traditional &quot;style of play&quot; comps more intriguing (ex. who will Donovan Clingan&apos;s NBA game mirror?). However, those typically lend themselves better to a more film-reliant approach (ex. who does Clingan remind you of when you watch him at UConn). Whereas, data helps discern just how similar a draft prospect is to a possible NBA comp. (ex. about how similar is Clingan to, say, Walker Kessler?). In future work, I&apos;ll consider pairing these two concepts – style of play comps contextualized using percentage similarity.
          </p>
          <p className="mb-4">
            Since my dataset only includes draft eligible players who&apos;ve entered the league since 2013, the potential player comps are constrained to that subset. Rather than offering historic comparisons from all players in NBA history, my board limits <strong>statistical similarity only to players from the &quot;modern&quot; era,</strong> credited as <a href="https://statds.org/events/ucsas2020/posters/ucsas-4-UCSAS_Poster_-_Joao_Vitor_Rocha_da_Silva_and_Paulo_Canas_Rodrigues.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-200 underline">originating around the 2013-14 season.</a>
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
            The skills graphs are a visual representation of different aspects of prospect profiles. Specifically, they include size, athleticism, defense, rebounding, scoring, passing, shooting, and efficiency. These &quot;skills&quot; are <strong>data values converted to 0-100 percentiles,</strong> by role. 
          </p>
          <p className="mb-4">
            Therefore, the skills graphs are <strong>not comparable across different positions.</strong> For instance, while Quentin Post profiled as a 99th percentile shooter relative to all bigs in my dataset, he is not quite a 99th percentile shooter relative to all draft prospects of any position. Similarly, while Tyler Smith profiled as a 28th percentile big in size, at 6&apos;9&quot; without shoes, he&apos;s obviously better than 28th percentile in size relative to all draft prospects of any position.
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
      id: 'data',
      title: 'What data are you using?',
      content: (
        <div>
          <p className="mb-4">
            My dataset includes <strong>draft eligible prospects who&apos;ve entered the NBA since 2013.</strong> In part, I use the 2013 draft class as a cutoff, since that 2013-14 season is credited as, roughly, the <a href="https://statds.org/events/ucsas2020/posters/ucsas-4-UCSAS_Poster_-_Joao_Vitor_Rocha_da_Silva_and_Paulo_Canas_Rodrigues.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-200 underline">beginning of the &quot;modern&quot; era.</a> While I might add a few earlier draft classes in future work, broadly, I think it&apos;s best to compare prospects who&apos;ve played in the contemporary NBA. The factors that contributed to a young player&apos;s success twenty years ago, obviously, differ from those that contribute to a young player&apos;s success today. See &quot;How do you compute the player-comps (similarity scores)?&quot; for further context about the modern era and the teams/terminology that have shaped it. 
          </p>
        </div>
      )
    },
    {
      id: 'data-source',
      title: 'How did you source your data?',
      content: (
        <div>
          <p className="mb-4">
            I <strong>web-scrapped most of the statistical production data</strong> from Sports Reference (NCAAM) and RealGM (International & G League). However, as there are data tracking inconsistencies across different league types, there is certain data that I calculated myself. Most notably, I <strong>calculated BPM (Box Plus/Minus) for international and G League prospects</strong> in my dataset. Thanks to Nick Kalinowski for helping me learn how to do this – <a href="https://www.basketball-reference.com/about/bpm2.html" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-200 underline">how to calculate BPM</a>, for anyone interested. As a subscriber to <em>Dunks & Threes</em>, I simply <strong>downloaded the yearly NBA EPM data</strong> going back to the 2013-14 regular season. Lastly, to join all this data from different websites, I used fuzzy matching (approximate string matching), overcoming player name inconsistencies (ex. suffixes and accents).
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
      id: 'differences',
      title: "How do you account for differences across leagues (ex. NCAA vs International)?",
      content: (
        <div>
        <p className="mb-4">
          There are significant deviations in structure, style of play, playing time (opportunity), and level of competition across different basketball leagues (ex. NCAA D1 vs Spain&apos;s Liga ACB). Hence, to project all prospects together, it&apos;s imperative to standardize data across different leagues. 
        </p>
        <p className="mb-4">
          To accomplish this, I began by referencing Layne Varsho&apos;s &quot;<a href="https://fansided.com/2015/11/06/deep-dives-measuring-level-of-competition-around-the-world/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-200 underline">Measuring Level of Competition Around the World.</a>&quot; Layne deserves a lot of credit for this work, which – despite being published back in 2016 – is still regarded as one of the best basketball league analysis in the public sphere. However, since publication, a lot has changed, including NCAA conference realignment, the level of play in certain international leagues, and the emergence/decline of pre-NBA development teams (ex. G League Ignite). Therefore, I <strong>did my best to update Layne&apos;s z-scores/strong</strong> (the weights he assigned to each league based on how statistical production, in that league, translates to &quot;NBA potential&quot;). 
        </p>
        <p className="mb-4">
          While updating Layne&apos;s z-scores might appear straightforward, the process proved somewhat convoluted and, admittedly, a slight departure from Layne&apos;s original intent. Specifically, in his article, Layne wisely points out that his z-scores, a measure of statistical translation to the NBA, are &quot;highly correlated&quot; but not &quot;exactly the same&quot; as strength of competition. On the other hand, <strong>strength of schedule (SOS)</strong>, a metric tracked by Sports Reference for college basketball teams, is the key to my standardization. See, Layne&apos;s z-scores include college basketball conferences. By analyzing the relationship between the z-scores of a certain conference (ex. the ACC) and the SOS ratings of teams in that conference (ex. Duke), I programmatically imputed college basketball equivalent SOS ratings for International and G League teams. Put simply, I converted z-scores that are &quot;correlated with&quot; but &quot;not exactly&quot; strength of competition to a uniform measure of strength of competition. 
        </p>
        <p className="mb-4">
          Ok, but how do you know if those uniform SOS ratings are actually good? How did you determine the updated z-scores that would produce the &quot;best&quot; college equivalent SOS ratings? I simply iterated the z-scores, which in turn produce the non-college SOS ratings, via extensive guess and check. After adjusting the z-scores for each league, I observed how well those new imputed SOS ratings standardized my dataset. And, <strong>after enough iteration, I landed on z-scores and, by extension SOS ratings, that produced standardized stats (ex. points per game) that showed no correlation with strength of competition (i.e. data unbiased by a prospect&apos;s pre-NBA league).</strong>
        </p>
        <p className="mb-4">
          That process relies on <strong>linear standardization</strong> to the mean college strength of schedule. Note, that mean college SOS refers to the average strength of schedule of all the college basketball players in my dataset (players who&apos;ve entered the NBA since 2013). That value (7.54) is, likely close, but not exactly the same as the average strength of schedule for all college basketball teams – or, at least, D1 teams – across that time period.
        </p>
        <p className="mb-4">
          If you were able to follow all that, by now, you&apos;ve probably identified some pretty clear flaws. Most significantly, my &quot;strength of competition&quot; metric is really just a measure of &quot;strength of league&quot; for international and G League prospects, whereas it actually considers yearly variations in team schedules for NCAA prospects. Undoubtedly, there is <strong>still significant room for improvement</strong>, scope to iterate my data standardization by strength of competition.
        </p>
        <p className="mb-4">
         Nevertheless, <strong>standardizing NBA draft data by shared SOS produces as close to competition-agnostic data as possible.</strong> In other words, normalizing international, G League, and college data to the mean college SOS (the average NCAA strength of competition) enables statistical comparison of draft prospects from different leagues.
        </p>
        </div>
      )
    },
    {
      id: 'age',
      title: 'How do you account for age disparities?',
      content: (
        <div>
          <p className="mb-4">
            It&apos;s important to account for differences in prospects&apos; draft age, since it is often indicative of different stages of development and maturity. Intuitively, an 18-year-old freshman&apos;s statistical production should be interpreted differently than that of a 22-year-old senior, as they are at different stages of development. Generally, the better you can contextualize your data, the clearer view you&apos;ll have of each entry.
          </p>
          <p className="mb-4">
            To accomplish this, I use a similar <strong>linear standardization</strong> process to level of competition. In standardizing entries to the average draft age in my dataset (21.06), I produce stats that show no correlation with age. This process is straightforward, but it&apos;s worth noting that I only adjust the  dataset by age after having already standardized the data by level of competition (the latter being more complex).
          </p>
          </div>
      )
    },

    {
      id: 'predictor-models',
      title: 'What kind of predictors do you use for your models?',
      content: (
        <div>
          <p className="mb-4">
            I use predictors (aka features) that fall into one of <strong>five categories: draft age, size, athleticism, statistical production, or consensus.</strong> Primarily, my size and athleticism predictors are derived from Nick Kalinowski&apos;s <a href="https://njk11.pythonanywhere.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-200 underline">combine score</a> tool. All production features, meanwhile, are standardized and engineered from the raw stats you can find on sites like Sports Reference or RealGM. Consensus, lastly, is measured through binary (0/1) indicators, such as whether a prospect is a projected lottery pick.
          </p>
          </div>
      )
    },
    {
      id: 'data-use',
      title: 'Can I see your data and use it for my own analysis?',
      content: (
        <div>
          <p className="mb-4">
            <strong>Hopefully in the near future, yes.</strong> We would like to offer access to the data I use for my models (except the EPM data, which is not mine to share) as part of an upcoming subscription service. In doing so, subscribers could pursue their own draft analysis without having to source, standardize, and clean the data themselves – often the most time-intensive and tedious part of the data science process. Specifically, this will include access to the international and g-league BPM&apos;s I&apos;ve calculated, features I&apos;ve engineered, a &quot;raw&quot; copy of the dataset, and a copy standardized by both age and strength of competition.
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
            However, if either the tier or EPM model (or their aggregate) differ dramatically from your own perspective and you would like to better understand why, reach out to me <a href="https://x.com/supersayansavin" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-200 underline">@supersayansavin on X</a> and I can try to offer a reasonable explanation. <strong>The skills graphs</strong> (spider charts), in particular, can also <strong>help reveal where my data might be under/over-rating a prospect&apos;s skill set</strong> relative to general consensus.
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
            <strong>Yes,</strong> I try to watch and learn as much about each prospect – qualitatively – as I can, <strong>but it does not factor into any of my models&apos; output</strong> (i.e. what you see on my big board). While I love watching college, international, g-league, and NBA hoops, I don&apos;t, yet, feel compelled to publish my own personal opinion on prospects. 
          </p>
          <p className="mb-4">
            For one, there is already a plethora of high quality, more conventional, scouting published online. Moreover, while I&apos;ve followed the NBA and college basketball my whole life, <strong>there&apos;s still a lot I have to learn.</strong> It&apos;s remarkable how much transpires possession to possession, that if you&apos;re not watching closely, completely flies over your head. 
          </p>
          <p className="mb-4">
            Nevertheless, I do recognize the value of &quot;watching games.&quot; And, therefore, possibly in the future I will put out a more hybrid board that balances model output with my own opinion (objectivity with subjectivity – quantitative with qualitative).
          </p>
          <p className="mb-4">
            Certainly, <strong>I encourage you <a className="underline">not</a> to take my pure-model board as definitive and, instead, simply consider where it differs/aligns with your own perspective and – more importantly – why.</strong> Additionally, if model or &quot;stats-heavy&quot; draft boards are just not for you, I can respect that; we are actively looking to add more qualitative (film-reliant) draft boards to the site as well.
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
            I began working on the original EPM draft model two years ago and have since spent at least <strong>1000 hours</strong> developing and iterating all that constitutes my board. If you know what you&apos;re doing, it doesn&apos;t take too much time to build a draft model. But it takes a mind-boggling amount of time to build one well.
          </p>
          <p className="mb-4">
            Despite my efforts, only additional time will tell if the resources I&apos;ve built are all that predictive. You can&apos;t truly prove model efficacy or performance until deployment. And, naturally, as basketball evolves so should the tools you use to evaluate it. With that in mind, I expect to always be developing and iterating my approach to the draft, including statistical models, for as long as I can.
          </p>
        </div>
      )
    },
    {
      id: 'code-type',
      title: 'Which programming language did you use?',
      content: (
        <p className="mb-4">
          I developed all the models/analysis displayed on my draft board in <strong>Python.</strong> The frontend itself is built with <strong>HTML, CSS, Typescript and Javascript (Next.js).</strong>
        </p>
      )
    },
    {
      id: 'about-bala',
      title: 'Why does your board look so nice visually?',
      content: (
        <p className="mb-4">
          The one-and-only, <strong>Bala Ravikumar</strong> is responsible for programming all the visually striking draft boards across the site, including my own. We have worked extensively together to &quot;get the design right&quot; and iron out small details, leading to draft boards that we hope you will enjoy browsing. Please let us know if you have any design feedback or suggestions. While we are pleased with the current look of the site, we&apos;re always trying to make improvements.
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
        Thank you to <strong>Mike Gribanov</strong> (<a href="https://x.com/mikegrib8?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-200 underline">@mikegrib8 on X</a>) for his feedback and input, as well as all the members of the NBA draft group chat he added me to (ifykyk). It&apos;s hard not to learn more about basketball when you&apos;re spammed with hundreds of messages a day about the sport. 
      </p>
      <p className="mb-4">
        Lastly, thanks to <strong>Josh Lloyd</strong> (<a href="https://x.com/redrock_bball?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-200 underline">@redrock_bball on X</a>) who&apos;s draft content first inspired me to pursue my own.
      </p>

        </div>
      )
    },
    {
      id: 'about-max',
      title: 'Who is Max Savin and how can I contact him?',
      content: (
        <p>
          I am a business and data science graduate from NYU Stern School of Business (class of 2024) looking to tie my obsession with sports to my profession. You can reach me at mes9950@stern.nyu.edu or find me on X <a href="https://x.com/supersayansavin" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-200 underline">@supersayansavin</a>.
        </p>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#19191A]">
      <NavigationHeader activeTab="" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            FAQs
          </h1>
          <p className="text-gray-300 mb-4">Learn about my draft model & analysis via frequently asked questions</p>
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