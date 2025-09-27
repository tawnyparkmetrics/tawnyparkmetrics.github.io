"use client";
import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
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

//need to highlight different columns based on dropdown
const ProspectsTable = () => {
    const headers = [
        {
            title: "Draft Class",
            tooltip: null
        },
        {
            title: "Total Prospects",
            tooltip: "# of prospects that appear on at least one board"
        },
        {
            title: "5% Threshold",
            tooltip: "# of prospects that appear on, at least, ~5% of boards"
        },
        {
            title: "Total Ranks",
            tooltip: "across all boards"
        },
        {
            title: "Total Boards",
            tooltip: null
        },
        {
            title: "Avg. Prospects per Board",
            tooltip: null
        }
    ];

    return (
        <div className="overflow-x-auto my-4">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-700">
                        {headers.map((header, index) => (
                            <th key={index} className="border border-gray-600 px-4 py-2 text-left text-white relative group cursor-pointer">
                                {header.title}
                                {header.tooltip && (
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-black text-white text-sm rounded shadow-lg invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 min-w-max">
                                        {header.tooltip}
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-black"></div>
                                    </div>
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {[
                        ['2025', '291', '122', '9334', '164', '56.9'],
                        ['2024', '178', '110', '6383', '111', '57.5'],
                        ['2023', '176', '123', '4358', '71', '61.4'],
                        ['2022', '179', '118', '6507', '100', '65.1'],
                        ['2021', '150', '116', '6883', '104', '66.2'],
                        ['2020', '192', '128', '4172', '63', '66.2']
                    ].map((row, index) => (
                        <tr key={row[0]} className={index % 2 === 0 ? '' : 'bg-gray-800/30'}>
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="border border-gray-600 px-4 py-2 text-white">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const NBAConsensusTable = () => {
    // Function to get blue gradient based on value (0-100 scale)
    const getColorForValue = (value: string | undefined) => {
        if (!value || value === 'N/A') return 'transparent';

        let numValue = parseFloat(value.replace('%', ''));
        if (isNaN(numValue)) return 'transparent';

        // Convert to 0-1 scale
        const normalized = Math.max(0, Math.min(100, numValue)) / 100;

        // Use blue gradient with variable opacity
        const opacity = 0.1 + normalized * 0.4; // Range from 0.1 to 0.5
        return `rgba(59, 130, 246, ${opacity})`;
    };

    // Restructured data with years on the side
    const yearGroups = [
        {
            year: '2020',
            rows: [
                { category: 'Lottery', nba: '37.5', consensus: '84.4', correlation: '52.5%' },
                { category: 'Top 30', nba: '53.1', consensus: '89.1', correlation: '79.6%' },
                { category: 'Top 60', nba: '79.1', consensus: '88.4', correlation: '75.0%' },
            ]
        },
        {
            year: '2021',
            rows: [
                { category: 'Lottery', nba: '65.7', consensus: '55.2', correlation: '87.3%' },
                { category: 'Top 30', nba: '83.2', consensus: '66.3', correlation: '62.4%' },
                { category: 'Top 60', nba: '28.4', consensus: '64.2', correlation: '79.5%' },
            ]
        },
        {
            year: '2022',
            rows: [
                { category: 'Lottery', nba: '97.0', consensus: '80.2', correlation: '87.3%' },
                { category: 'Top 30', nba: '100', consensus: '78.2', correlation: '83.3%' },
                { category: 'Top 60', nba: 'N/A', consensus: '92.2', correlation: '86.4%' },
            ]
        },
        {
            year: '2023',
            rows: [
                { category: 'Lottery', nba: '97.2', consensus: '88.9', correlation: '62.6%' },
                { category: 'Top 30', nba: '77.1', consensus: '68.6', correlation: '85.7%' },
                { category: 'Top 60', nba: 'N/A', consensus: '68.4', correlation: '84.6%' },
            ]
        },
        {
            year: '2024',
            rows: [
                { category: 'Lottery', nba: '12.5', consensus: '57.1', correlation: '70.1%' },
                { category: 'Top 30', nba: '42.3', consensus: '80.8', correlation: '74.8%' },
                { category: 'Top 60', nba: 'N/A', consensus: '93.1', correlation: '92.1%' },
            ]
        },
        {
            year: '2025',
            rows: [
                { category: 'Lottery', nba: 'N/A', consensus: 'N/A', correlation: '95.6%' },
                { category: 'Top 30', nba: 'N/A', consensus: 'N/A', correlation: '74.7%' },
                { category: 'Top 60', nba: 'N/A', consensus: 'N/A', correlation: '89.3%' },
            ]
        },
    ];

    return (
        <div className="overflow-x-auto my-4">
            <table className="w-full border-collapse border border-gray-600">
                <thead>
                    <tr>
                        <th className="border border-gray-600 px-4 py-2 text-center text-white font-bold" colSpan={2}>Draft Class</th>
                        <th className="border border-gray-600 px-4 py-2 text-center text-white font-bold">NBA</th>
                        <th className="border border-gray-600 px-4 py-2 text-center text-white font-bold">Consensus</th>
                        <th className="border border-gray-600 px-4 py-2 text-center text-white font-bold">Correlation</th>
                    </tr>
                </thead>
                <tbody>
                    {yearGroups.map((yearGroup, yearIndex) => 
                        yearGroup.rows.map((row, rowIndex) => (
                            <tr key={`${yearGroup.year}-${rowIndex}`} className="">
                                {rowIndex === 0 && (
                                    <td 
                                        rowSpan={yearGroup.rows.length}
                                        className="border border-gray-600 px-4 py-2 text-white font-bold text-center align-middle"
                                    >
                                        {yearGroup.year}
                                    </td>
                                )}
                                <td className="border border-gray-600 px-4 py-2 text-white italic">
                                    {row.category}
                                </td>
                                <td
                                    className="border border-gray-600 px-4 py-2 text-white text-center"
                                    style={{ backgroundColor: getColorForValue(row.nba) }}
                                >
                                    {row.nba}
                                </td>
                                <td
                                    className="border border-gray-600 px-4 py-2 text-white text-center"
                                    style={{ backgroundColor: getColorForValue(row.consensus) }}
                                >
                                    {row.consensus}
                                </td>
                                <td
                                    className="border border-gray-600 px-4 py-2 text-white text-center"
                                    style={{ backgroundColor: getColorForValue(row.correlation) }}
                                >
                                    {row.correlation}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default function ConsensusFAQPage() {
    const [openSections, setOpenSections] = useState({});

    const toggleSection = (sectionId: string) => {
        setOpenSections((prev: Record<string, boolean>) => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    useEffect(() => {
        document.title = 'NBA Draft Internet Consensus FAQs';
    }, []);

    const sections = [
        {
            id: 'what-is',
            title: 'What is the Internet Consensus?',
            content: (
                <p>
                    Tawny Park Metrics' <em>NBA Draft Internet Consensus</em> is <strong>the largest collection of individual NBA Draft boards in existence.</strong> It includes as many publicly available boards as possible, along with any private boards submitted directly to us.
                    To ensure fairness, <strong>every board included in the consensus is published publicly and/or submitted before the NBA Draft.</strong>
                </p>
            )
        },
        {
            id: 'value',
            title: 'What is the value of this consensus?',
            content: (
                <div>
                    <p className="mb-4">
                        As the largest collection of individual boards, the <em>Internet Consensus</em> offers <strong>the single most comprehensive measure of aggregate opinion on NBA prospects.</strong> Since 2020, it has included an average of 102 boards per year
                        – reaching a record 164 boards in 2025. This scale yields a diverse range of approaches: statistical models, traditional scouting, and every hybrid approach in between – from large organizations and independent analysts alike.
                        By accepting almost any type of board from nearly any source, TPM's <em>Internet Consensus</em> <strong>captures almost every kind of draft perspective.</strong>
                    </p>
                    <p className="mb-4">
                        The <em>Internet Consensus</em> is not only a valuable tool to <strong>gauge aggregate opinion on prospects.</strong> Every year, hundreds of boards are shared into the internet void,
                        consumed before the draft and rarely revisited. We'd like to change that. Improvement as an evaluator requires reviewing your hits and misses – understanding where you excel and where you can grow. Want to show fans
                        or teams how well you project the draft? Now, you can. <strong>As some players have shared with us: maybe it's time the analysts felt what it's like to be evaluated too.</strong>
                    </p>
                    <p>
                        Of course, plenty of analysts are already scrutinized to varying extents. But this evaluation is considerably more objective than what you'll typically find in replies or comments sections.
                    </p>
                </div>
            )
        },
        {
            id: 'limitations',
            title: 'What are the limitations of the consensus board?',
            content: (
                <div>
                    <p className="mb-4">
                        In most fields, when we think of consensus we think of the <em>wisdom of the crowd</em> – the concept that a "large group of diverse, independent individuals is often smarter at problem-solving and decision-making than an
                        individual expert, as their collective judgments tend to converge on the truth." However, when it comes to the NBA Draft, opinions are seldom completely independent from each other.
                    </p>
                    <p className="mb-4">
                        The draft space is subject to significant <strong>group-think</strong> – analysts constantly shape each other's perspectives as they share and learn from one another. While this circulation of ideas is positive and valuable, it <strong>limits
                            the independence required for true wisdom of the crowd.</strong> This reduced independence often leads to anchor bias, influencing which players typically appear on draft boards and how they're ranked. That's not to say there's no
                        independent thinking at all, but our constant sharing of opinions and insights can, ironically, make the <em>Internet Consensus Board</em> less predictive.
                    </p>
                    <p className="mb-4">
                        Additionally, our board submission process introduces some <strong>voluntary-response bias</strong> – possibly, certain analysts are more likely to submit their board to our consensus than others. In older classes, this led to a slight
                        over-representation of "Draft Twitter" relative to other sources (ex. incumbent organizations & Reddit). In recent classes, we've mitigated this bias by incorporating a significant number of boards not submitted directly to us.
                        Although, some self selection is inevitable when you're collecting boards online, primarily, via google form and social media. Naturally, there's also an element of implicit bias in deciding which boards to source that aren't submitted directly to us.
                    </p>
                    <p>
                        Ultimately, while we are conscious of and transparent about these limitations, we remain confident in the consensus board's overall utility. They are <strong>important to keep in mind when interpreting the board, but they do not substantially diminish its value or reliability.</strong>
                    </p>
                </div>
            )
        },
        {
            id: 'ranking-method',
            title: 'How are prospects ranked?',
            content: (
                <div>
                    <p className="mb-4">
                        Prospects are ranked via a weighted combination of their average (mean) rank and their inclusion rate across all boards. Specifically, the formula is:
                    </p>
                    <div className="bg-gray-800/50 p-4 rounded-lg mb-4 font-mono text-sm">
                        <strong>Final Score = (MinRank - AvgRank + 1) × (InclusionRate)^0.5</strong>
                    </div>
                    <p className="mb-4">where…</p>
                    <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                        <li><strong>MinRank</strong> = the lowest rank on the largest board that year
                            <ul className="list-disc list-inside ml-6 mt-2">
                                <li>In draft classes 2020-2025, this value is either 150 or 100, resulting in final scores out of 150 or 100 for each player</li>
                            </ul>
                        </li>
                        <li><strong>InclusionRate</strong> = # of boards player appears on / total # of boards that year</li>
                        <li><strong>^0.5</strong> is the same as taking the square root of inclusion rate
                            <ul className="list-disc list-inside ml-6 mt-2">
                                <li>Since inclusion rate is a proportion (decimal value) between 0-1, taking the square root gives inclusion rate a slight boost</li>
                            </ul>
                        </li>
                    </ul>
                    <p className="mb-4">
                        <strong>Players are then sorted by this score to finalize their consensus rank order.</strong> The goal is straightforward: reward prospects who are consistently included and ranked highly on boards.
                    </p>
                    <p className="mb-4">
                        The main challenge is that board sizes vary significantly. At first glance, you might consider normalizing scores (ranks) relative to board size – but that creates further issues. For instance, treating 30th on a 100-player board as more valuable than 30th on a 30-player
                        board doesn't make perfect sense. In both cases, the analyst ranked that prospect 30th. Logically, both rankings should, thus, contribute equally to the player's overall consensus rank.
                    </p>
                    <p className="mb-4">
                        Our solution is to factor in inclusion rate alongside mean rank. This ensures that exact ranks are treated uniformly across boards, while still penalizing players who appear on only a few.
                    </p>
                    <p className="mb-4">
                        Notably, you wouldn't want to sort by mean rank alone. For example, it would be misleading to rank Hunter Dickinson (mean rank = 52.7) ahead of Brice Williams (mean rank = 53.1), when Hunter was included on just 10/164 total boards, compared to Brice's 64/164.
                    </p>
                    <p>
                        The <strong>final result is a balance between average rank and inclusion rate.</strong> While we may iterate the equation in the future (ex. testing which exponent value for inclusion rate yields the most predictive aggregate scores), we are satisfied with its current output: fair consensus ranks for every draft prospect.
                    </p>
                </div>
            )
        },
        {
            id: 'how-many-prospects',
            title: 'How many prospects are ranked?',
            content: (
                <div>
                    <p className="mb-4">Here's a detailed breakdown of the number of prospects ranked per consensus draft class:</p>
                    <ProspectsTable />
                    <p>
                        You can find this same information in <em>How many boards make up this consensus?</em>. Feel free to also reference the subheader, table view, and evaluation for each draft class consensus page.
                    </p>
                </div>
            )
        },
        {
            id: 'graphs-stats',
            title: 'What are the graphs & stats displaying for each prospect?',
            content: (
                <div>
                    <p className="mb-4">
                        In the dropdown for each prospect card, you'll find "Rank View" and "Range View". Both views depict how each prospect is perceived across the boards that contribute to the consensus.
                    </p>
                    <p className="mb-4">
                        <strong>Rank View displays individual rankings from each board, along with summary stats </strong> (mean rank, median rank, high, low, range, etc.). <strong>Range View groups those rankings into broader draft tiers </strong>(Top 3, 2nd Round, Undrafted, etc.), showing how often
                        a prospect falls into each tier (ex. Cooper Flagg was ranked in the top three on 100% of 2025 Draft boards).
                    </p>
                    <p>
                        To easily reference this explanation in card view, hover over (on PC) or tap (on mobile) the ? icon. You can also find this data in table view under the "Consensus Rank" and "Consensus Range" customize table column headers.
                    </p>
                </div>
            )
        },
        {
            id: 'years-back',
            title: 'How many years does this consensus go back?',
            content: (
                <p>
                    Often referred to as the "<strong>Draft Twitter Megaboard</strong>", this consensus was founded by <strong>Mike Gribanov</strong> (<a href="https://x.com/mikegrib8" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">@mikegrib8</a>) and company in 2018. However, currently,
                    TPM only has access to consensus boards starting in 2020. Therefore, <strong>2020 is the oldest consensus displayed on the site.</strong> If possible, we will add and evaluate older boards in future work.
                </p>
            )
        },
        {
            id: 'how-many-boards',
            title: 'How many boards make up this consensus?',
            content: (
                <div>
                    <p className="mb-4">Here's a detailed breakdown of the number of draft boards per consensus draft class:</p>
                    <ProspectsTable />
                    <p>
                        You can find this same information in <em>How many prospects are ranked?</em>. Feel free to also reference the subheader, table view, and evaluation for each draft class consensus page.
                    </p>
                </div>
            )
        },
        {
            id: 'which-boards',
            title: 'Which boards make up this consensus?',
            content: (
                <p>
                    To see which boards make up a select consensus, <strong>check out the "Evaluation" view.</strong> In evaluation, you can find a <strong>table with every board that contributed to the consensus that year (under the "Board" column)</strong>.
                    Additionally, you can search for a board directly in the "Search Contributors" search bar and find the number of prospects ranked per board under the "Size" column.
                </p>
            )
        },
        {
            id: 'board-priority',
            title: 'Are any boards prioritized over others?',
            content: (
                <div>
                    <p className="mb-4">
                        <strong>No.</strong> We intentionally take a more egalitarian approach. While some boards, on average, may prove more predictive than others, <strong>we believe they all possess inherent value.</strong> Consensus shapes the way
                        teams, agents, analysts, and fans perceive prospects. As a highly influential and debated concept, it is worth measuring, visualizing, and understanding. Prioritizing certain boards or sources over others would introduce significant bias, distorting that understanding.
                    </p>
                    <p>
                        That said, as we track the consensus and the performance of its individual boards over time, <strong>we will likely experiment with cohorts.</strong> These groupings will never replace the overall <em>Internet Consensus</em>, but, in addition,
                        could offer further insight – for example, highlighting key distinctions between more stats-driven vs eye-test approaches, or large outlets vs Draft Twitter.
                    </p>
                </div>
            )
        },
        {
            id: 'evaluation-method',
            title: 'How are individual boards evaluated?',
            content: (
                <div>
                    <p className="mb-4">
                        To explain how we evaluate draft boards, we first need to establish a shared understanding of what they represent. At the most basic level, a board is a ranked list of draft prospects. But, more meaningfully, they <strong>indicate the order in which an analyst would select players
                            if they, theoretically, controlled every pick in the draft.</strong> Any evaluation, then, becomes a matter of comparing one order to another. For our purposes, this is <strong>a measure of the difference between any single board and, in retrospect, the "optimal" one.</strong>
                    </p>
                    <p className="mb-4">
                        But how do you define optimal? In a 2025 redraft of the 2020 NBA class, fans would, inevitably, make a wide range of differing selections. Some might take Anthony Edwards first, others Tyrese Haliburton or LaMelo Ball – extending that process across all 60 picks would produce
                        countless permutations. <strong>By definition, no universally agreed upon "true" redraft exists.</strong> Consequently, choosing the criteria to define optimality is inherently challenging and subjective.
                    </p>
                    <p className="mb-4">For now, <strong>we evaluate board performance via:</strong></p>
                    <ol className="list-decimal list-inside space-y-2 ml-4 mb-4">
                        <li>Estimated Plus Minus (<strong>EPM</strong> from Dunks&Threes)</li>
                        <li>Estimated Wins (<strong>EW</strong> from Dunks&Threes)</li>
                        <li><strong>Redraft + Pick Value</strong></li>
                    </ol>
                    <p className="mb-4"><em>We intend to add DARKO & CraftedPM in the near future.</em></p>
                    <p className="mb-4">
                        <strong>EPM</strong> and <strong>EW</strong> are advanced "all-in-one" metrics measuring per-possession and aggregate impact, respectively. They are relatively objective criteria that, while similar, produce distinct redraft orders.
                    </p>
                    <p className="mb-4">
                        <strong>Redraft + Pick Value</strong> is far more subjective. Currently, this redraft order is determined internally by TPM. However, moving forward, <strong>we will transition to a community redraft</strong> (based on input from site-visitors). Ultimately, this criteria is more closely related
                        to public-sentiment than EPM or EW ratings alone. While that opinion generates the redraft order, it still requires a scale.
                    </p>
                    <p>
                        For this, we use a normalized <strong>combination of <a href="https://x.com/kpelton/status/1009888366605881344?lang=en" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Kevin Pelton's</a> & <a href="http://nbasense.com/draft-pick-trade-value/4/jacob-goldstein-4" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Jacob Goldstein's</a> draft pick value charts.</strong> The result is a scale assigning 4000 points to the
                        first pick and 165.59 points to the 60th pick, with values distributed non-linearly in between.
                    </p>
                    <p className="mb-4">
                        Ok, so we've established what a draft board represents and how we use varied criteria to define optimal redraft orders. But how do we actually evaluate a board against these redraft orders?
                        Put simply, <strong>we simulate each board as a draft order and calculate the average opportunity cost of every suboptimal selection.</strong> To explain the reasoning behind this approach, it's worth outlining the simpler alternatives we first considered and why they fall short.
                    </p>
                    <p className="mb-4">
                        The simplest way to evaluate pre-draft rankings is via some form of correlation. Essentially, what was the correlation between the order of each board's rankings and the order of a redraft, based on a select criteria (ex. redraft in the order of career EPM)? While
                        correlation successfully measures the strength of the ranking relationship, it ignores the <strong>magnitude of prediction errors.</strong>
                    </p>
                    <p className="mb-4">
                        For instance, in 2020, the Golden State Warriors infamously selected James Wiseman 2nd, passing on Tyrese Haliburton, who was picked 12th. In the same class, they selected Nico Mannion 48th, passing on Paul Reed, who was picked 58th. In both cases, the pick distance between the
                        player selected and, debateably, the optimal alternative was ten spots. A correlation-based evaluation treats these misses as equivalent. In reality, we all know passing on Haliburton for Wiseman was a far more costly mistake than passing on Reed for Mannion. Correlation fails to
                        account for the non-linear cost of draft suboptimal draft decisions.
                    </p>
                    <p className="mb-4">
                        The next natural progression is an error-based approach, such as MAE (mean-absolute error). Here each draft board is treated as a set of predictions about player value. Thus, we can compare, for example, the career avg. EPM of the player ranked first on a board to
                        the career avg. EPM of the true top EPM performer. Accordingly, we can <strong>measure "loss" through the scale of each criteria</strong>, a clear upgrade over raw-correlation. But, in the words of Lee Corso, not so fast my friend. Take a look at what happens when you actually implement MAE:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                        <li>Board ranks LaMelo #1. In the redraft, he's #3. Pick #1 = 4000 points, Pick #3 = 2799.61 points. Loss = 1200.39 (abs).</li>
                        <li>Board ranks Haliburton #3. In the redraft, he's #1. Pick #3 = 2799.61 points, Pick #1 = 4000 points. Loss = 1200.39 (abs).</li>
                    </ul>
                    <p className="mb-4">
                        <em>Note, I would've included EPM or EW in this example, but those ratings are exclusive to paid subscribers to the Dunks&Threes website. To clarify, TPM pays for a yearly subscription – enabling us to access EPM & EW ratings for internal analysis, not external distribution.</em>
                    </p>
                    <p className="mb-4">
                        <strong>Taking the MAE (the absolute value difference between a player's predicted value and their redraft value) double-counts errors.</strong> In practice, this exaggerates the penalty of single mistakes. However, using error as a measure of opportunity cost is, at least, a step in the right direction.
                    </p>
                    <p className="mb-4">
                        We want to answer: <strong>how much value did each board "miss" by not ranking</strong> (theoretically, selecting) <strong>players in the optimal order?</strong> In treating each ranking as a draft pick, we also want to avoid penalizing analysts for taking the best remaining player available (avoid double counting errors).
                    </p>
                    <p className="mb-4">
                        The last consideration is whether to measure the opportunity cost of passing on the <em>single</em> best available player, or on <em>all</em> better available players. We chose the latter, as it more closely mirrors how we judge real draft decisions. When a team selects Player A, we'll often consider multiple
                        alternatives (they could've taken Player B, C, D, etc.), both during the draft and years in the future.
                    </p>
                    <p className="mb-4">Accordingly, here's <strong>how the opportunity cost calculation works</strong>:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                        <li>Identify who the analyst ranked (i.e. who they would've selected at that spot)</li>
                        <li>Iterate through the optimal redraft order (ex. Estimated Wins) from best to worst</li>
                        <li>For each better player available (ex. with a career EW &#62; career EW of the prospect the analyst selected – i.e suboptimally ranked ahead)...
                            <ul className="list-disc list-inside ml-6 mt-2">
                                <li>Calculate the difference in value (ex. better EW - ranked player's EW)</li>
                                <li>Add that difference to the running average (ex. avg. career EW lost per pick)</li>
                            </ul>
                        </li>
                        <li><strong>STOP</strong> once reaching a player worse than the ranked player (ex. career EW &#60; career EW of the prospect the analyst selected)</li>
                        <li> Repeat for each successive rank, keeping track of already "selected" players (ex. once a player is selected, their EW is no longer included when calculating the avg. value lost)</li>
                        <li><strong> IF </strong> there are no better players available (i.e when analyst makes an optimal selection)...
                            <ul className="list-disc list-inside ml-6 mt-2">
                                <li>Set opportunity cost to zero (no penalty)</li>
                                <li>Move onto next highest ranked player</li>
                            </ul>
                        </li>
                    </ul>
                    <p className="mb-4">
                        The resulting output is the <strong>average opportunity cost for each player ranked up to a certain cutoff.</strong> For instance, Kevin Pelton's 2020 board missed out on an average of 1.058 career avg. EPM, per player ranked Top-14 (lottery). The generalized way to interpret this output: <strong>for every suboptimal pick (i.e. rank), on average, the analysts would've "lost" _____.</strong>
                    </p>
                    <p className="mb-4">We incorporate <strong>two additional exploratory criteria:</strong></p>
                    <ol className="list-decimal list-inside space-y-2 ml-4 mb-4">
                        <li><strong>Consensus</strong> (how close was each board to consensus)</li>
                        <li><strong>NBA</strong> (how correlated was each board with the NBA Draft results)</li>
                    </ol>
                    <p>
                        These are purely descriptive, but help identify how boards are aligned with consensus (using the same opportunity cost calculation as EPM, EW, & Redraft + Pick Value, but instead with the consensus score described in How are prospects ranked?) and with the NBA's collective draft decisions (using Spearman correlation).
                    </p>
                </div>
            )
        },
        {
            id: 'evaluation-parameters',
            title: 'What are the Lottery, Top 30, & Top 60 evaluation parameters?',
            content: (
                <div>
                    <p className="mb-4">
                        <strong>The 'Lottery', 'Top 30', and 'Top 60' cutoffs allow us to evaluate boards fairly, despite their varying sizes.</strong> As explained in <em>How are individual boards evaluated?</em>, we calculate the average opportunity cost of every suboptimal rank, but only up to these cutoffs. This way, we avoid comparing, say, a
                        35-player board directly to a 50-player board. Instead, we compare just their Lottery (top 14) and Top 30 rankings, ensuring the evaluation is on equal grounds. Boards with fewer prospects than a cutoff are simply omitted from that cutoff's evaluation (in the 35 & 50 example, neither board would qualify for the Top 60 evaluation).
                    </p>
                    <p>
                        These parameters also let users explore board performance in different contexts. For instance, some users might care more about which boards would've "drafted" the best Lottery, whereas others might care more about board performance across a full draft (typically, 60 picks).
                    </p>
                </div>
            )
        },
        {
            id: 'interpret-evaluation',
            title: 'How do you interpret the evaluation?',
            content: (
                <div>
                    <p className="mb-4">
                        The consensus evaluation <strong>tracks the predictiveness of each draft board, up to the most recent complete NBA season, according to multiple criteria.</strong> Lower average opportunity cost values for EPM, EW, and Redraft + Pick Value indicate that a board's rankings were, in hindsight, more accurate.
                    </p>
                    <p className="mb-4">
                        It's important to note these results are retrospective and, naturally, depend on the chosen criteria. They should be understood as <strong>measures of board predictiveness, not direct evidence of an analyst's process or ability.</strong>
                    </p>
                    <p>
                        For a deeper dive into methodology, see <em>How are individual boards evaluated?</em> or explore the <em>Evaluation Criteria</em> dropdown on each evaluation page.
                    </p>
                </div>
            )
        },
        {
            id: 'evaluation-takeaways',
            title: 'Any initial takeaways from the evaluation?',
            content: (
                <div>
                    <p className="mb-4">
                        Relative to most public boards, <strong>the NBA collectively makes better draft decisions than general narrative suggests.</strong> Acknowledging that NBA teams hold clear advantages (personnel, data, access, etc.), their 1st round performance is 71st percentile since 2020. However, as mentioned in <em>What are the NBA & Consensus
                            boards in evaluation?</em> (where you can find the NBA’s percentile draft performance by year), the impact of draft position on career outcomes does confound these results.</p>
                    <p className="mb-4">
                        Furthermore, <strong>board performance fluctuates considerably from draft to draft.</strong> Very few analysts have produced consistent top-end boards across multiple years. Some of this volatility is simply due to sample size: the number of boards per consensus is lower for certain classes (2020 & 2023). As we collect more boards
                        and build larger samples, we should begin to see a clearer picture of which analysts sustain predictive performance across three or more consecutive drafts.
                    </p>
                    <p className="mb-4">
                        For now, however, no one has, seemingly, “cracked” the draft. As we already knew, <strong>the draft is a problem without a perfect solution</strong> (extends to other sports as well). Every analyst has misses, and the data suggests we should all approach this process with humility. That said, the goal of the evaluation is not to discourage analysts; rather, to motivate continued learning, iteration, and refinement of their process.
                    </p>
                    <p className="mb-4">
                        In contrast to inconsistent board performance, there is a <strong>persistent divide between analysts who stick closely to consensus and those who take a more contrarian approach.</strong> These tendencies often align with how closely each board mirrors the NBA’s draft decisions. Partially, this is due to the availability of “insider” information (some analysts and organizations have better access), but strategy and
                        psychology likely play a role as well. It’s plausible that some evaluators are wary of straying too far from consensus, either consciously or due to implicit anchoring. Equally plausible is that others deliberately lean away from consensus, preferring to stand out from the crowd. This same concept applies to draft models as well. While models limit subjectivity, they don’t all weigh consensus or anticipated draft position
                        equally, if at all. Regardless of the validity of either tendency, their persistence is revealing in itself.</p>
                    <p className="mb-4">
                        <strong>In future work, we hope to analyze multi-year trends and apply clustering techniques</strong>, revealing more nuanced findings. Our interest lies less in individual board performance and more in identifying broader patterns: how do analysts naturally group, how do those groups perform, and what can we infer about specific draft approaches?
                    </p>
                    <p className="mb-4">
                        Finally, it’s worth remembering that <strong>most analysts adjust their process from year to year.</strong> Models are a good example – periodically refined, updated, or even rebuilt entirely. Thus, <strong>it’s difficult to place too much weight on long-term performance.</strong> How much does a three-draft track record really mean if an analyst altered their approach each year? In time, as we accumulate more data, we’ll find out.
                    </p>
                </div>
            )
        },
        {
            id: 'evaluation-limitations',
            title: 'What are the limitations of the consensus evaluation?',
            content: (
                <div>
                    <p className="mb-4">
                        <strong>Final prospect rankings are not a perfect reflection of an analyst’s entire process</strong> – especially when drawn from only a couple draft classes. Over time, however, you’d expect analysts with stronger pre-draft approaches to produce more predictive rankings. Comparatively, you wouldn’t judge a player’s ability too definitively on a single game performance, but across a larger sample, better players tend to differentiate themselves.
                    </p>
                    <p className="mb-4">
                        However, just like players, most analysts are constantly learning and iterating – the way you approach the draft evolves. Put simply, <strong>past performance does not guarantee future results.</strong> Ideally, analysts who improve their process will see stronger board performance in subsequent draft classes.
                    </p>
                    <p className="mb-4">
                        Therefore, we caution against using the Internet Consensus as a single source for deciding “who is a better analyst” – an inherently subjective question reliant on a considerable sample. <strong>For now, the consensus evaluation simply answers which analyst’s pre-draft rankings were more predictive of NBA outcomes for a given draft class.</strong>
                    </p>
                    <p className="mb-4">
                        Another key limitation is timing: evaluations of recent draft classes should be interpreted carefully. We rarely possess a complete understanding of player outcomes after just a couple seasons. Hence, <strong>until a select draft class has completed, at least, their rookie contracts, it’s not worth putting too much stock into the evaluation results.</strong> We display these interim results as a running tracker of board performance – useful for analysts, but not yet definitive.
                    </p>
                    <p className="mb-4">
                        So far, these caveats address how to <em>interpret</em> the consensus evaluation. Equally important, though, is <em>how</em> the boards are evaluated in the first place. For a detailed breakdown, reference <em>How are individual boards evaluated?</em>.
                    </p>
                    <p className="mb-4">
                        The <strong>most significant driver of evaluation outcomes is how analysts ranked the eventual top performers, relative to each criterion.</strong> In other words, the opportunity cost framework heavily rewards or penalizes boards depending on how well they projected the draft class’s best players. While this weighting is unforgiving, it mirrors the reality of NBA draft decisions, where passing on a future star has far greater consequences than, say, drafting a non-contributor in the 2nd round.
                    </p>
                    <p className="mb-4">
                        Based on user feedback, we plan to expand and refine our current evaluation criteria (Redraft + Pick Value, EPM & EW). For instance, we aim to <strong>replace our internally generated redraft order with community voting.</strong> Crowdsourcing user opinion will yield a more representative measure of public sentiment than TPM’s internal perspective alone.
                    </p>
                </div>
            )
        },
        {
            id: 'what-are-the-board-in-evaluation',
            title: 'What are the NBA & Consensus boards in evaluation?',
            content: (
                <div>
                    <p className="mb-4">
                        <strong>We treat both the NBA Draft results and the overall Internet Consensus as if they were individual boards.</strong> This allows us to measure their relative performance against each other and against all other submitted boards.
                    </p>
                    <p className="mb-4">
                        By definition, the “NBA” board is perfectly correlated with the NBA Draft results (100% across all parameters). Likewise, the “Consensus” board has zero error when compared to, well, consensus. The value, then, comes not from comparing either board to itself, but from examining <strong>how the NBA and public consensus compare to each other.</strong> For instance, in a given year, how closely were NBA Draft decisions tied to public consensus? Moreover, which better predicted future player outcomes?
                        Of course, the NBA holds intrinsic advantages, primarily, since draft decisions directly influence career outcomes and since teams, generally, have greater access to pre-draft intel.
                    </p>
                    <p>
                        Here are the results (as of the 2024/25 NBA season) across each draft class:
                        <NBAConsensusTable /> {/* gonna need to change the sytle of this table */}
                    </p>
                    <li><em><strong>The NBA & Consensus columns refer to their predictiveness</strong> as <strong>percentiles</strong> (higher value = more predictive)</em></li>
                    <ul className="list-disc list-inside ml-6 mt-2">
                        <li><em>Percentiles are based on their rank relative to all the individual boards that form the consensus that year</em></li>
                        <li><em>Top 60 in 2022-2024 are N/A for ‘NBA’, since there were less than 60 picks in these draft classes (will substitute with top 58 & top 59 comparisons, where applicable, in a future update)</em></li>
                        <li><em>2025 are all N/A since there is not any evaluation data (at the time of writing, players from this draft class are yet to play in the NBA)</em></li>
                    </ul>
                    <p>
                        <li><em>The <strong>Correlation % column refers to the similarity between NBA & Consensus</strong></em></li>
                        <ul className="list-disc list-inside ml-6 mt-2">
                            <li><em>Correlation % for ‘Top 60’, in 2022-2024, is really comparing Top 58 (only 58 draft picks – two forfeited)</em></li>
                            <li><em>Correlation % for ‘Top 60’, in 2025, is really comparing Top 59 (only 59 draft picks – one forfeited)</em></li>
                        </ul>
                    </p>
                </div>
            )
        },
        {
            id: 'submit-board-in-the-future',
            title: 'How can I submit my board to the consensus in the future?',
            content: (
                <div>
                    <p className="mb-4">
                        Every year we <strong>solicit draft boards on social media</strong> (primarily via X, but we try to post on BlueSky and Reddit as well). These posts (from <a href="https://x.com/supersayansavin" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">@supersayansavin</a> or <a href="https://x.com/mikegrib8" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">@mikegrib8</a>) include a <strong>link to a Google Form</strong>
                        where you can attach your board (preferably as a Google Sheet) and formally agree to be part of the consensus.
                    </p>
                    <p className="mb-4">
                        We will also continue to source public boards that are not directly submitted. (<em>In the spirit of Liam Neeson: we will look for you, we will find you, and we will collect your draft board.</em>)
                    </p>
                    <p>
                        On a more serious note, we are grateful to everyone who submits their board to the <em>Internet Consensus.</em> If you have any questions or concerns, please consult <em>For Contributors</em> at the bottom of this page.
                    </p>
                </div>
            )
        },
        {
            id: 'consensus-build',
            title: 'How is the consensus built?',
            content: (
                <div>
                    <p className="mb-4">
                        <strong>To date, the consensus has been constructed manually.</strong> Each year, volunteers from NBA “Draft Twitter” solicit boards online and then, by hand, enter their rankings into a shared Google Sheet. As you might expect, entering thousands of ranks across hundreds of boards is both tedious and time-consuming. It also leaves little margin for human error – misentering even a single rank or board creator can disrupt all of the work that follows.
                    </p>
                    <p className="mb-4">
                        <strong>Going forward, we plan to build a programmatic script that will automatically process, enter, and aggregate boards submitted directly to us.</strong> This will save tremendous time and effort, while simultaneously giving us the infrastructure to handle more boards than ever before. With these improvements to the “construction” process, we aim to further remove barriers to participation, advancing our core belief: <strong>if you create a draft board, it should contribute to the Internet Consensus.</strong>
                    </p>
                </div>
            )
        },
        {
            id: 'acknowledgements',
            title: 'Who helps put this together (acknowledgements)?',
            content: (
                <div>
                    <p className="mb-4">
                        The <em>NBA Draft Internet Consensus</em> (more commonly referred to as the <em>Draft Twitter Megaboard</em>) was founded by <strong>Mike Gribanov</strong> (<a href="https://x.com/mikegrib8" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">@mikegrib8</a>). Mike and I (Max Savin – <a href="https://x.com/supersayansavin" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">@supersayansavin</a>) have worked together to
                        process old consensus boards, update the consensus ranking system, and evaluate individual board performance. <strong>Bala Ravikumar</strong> (<a href="https://x.com/BalaRavikumar5" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">@BalaRavikumar5</a>) – with help from <strong>Seena Pourzand</strong> – publishes the consensus boards and evaluation to the TPM website.
                    </p>
                    <p className="mb-4">
                        We also want to highlight the “Draft Twitter” volunteers who have helped manually input every board and rank that makes up each year’s consensus, including: <strong><a href="https://x.com/SloanImperative" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">@SloanImperative</a><a href="https://x.com/thegrantedwards" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">@thegrantedwards</a></strong>, <strong><a href="https://x.com/codyreeves14" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">@codyreeves14"</a></strong>,
                        <strong><a href="https://x.com/dualbarl" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">@dualbarl</a></strong>, <strong><a href="https://x.com/CannibalSerb" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">@CannibalSerb</a></strong>, & <strong><a href="https://x.com/bendog28" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">@bendog28</a></strong>. This is an incredibly
                        tedious and time consuming task; these consensus boards would not exist without their past efforts. As noted in <em>How is the consensus built?</em>, we are working to make the aggregation process more efficient going forward – but the foundation laid by these volunteers is what enables the project in the first place.
                    </p>
                </div>
            )
        },
        {
            id: 'programming-languages',
            title: 'Which programming language(s) did you use?',
            content: (
                <div>
                    <p className="mb-4">
                        The boards are processed and evaluated over time in <strong>Python.</strong> The frontend is built with <strong>HTML, CSS, Typescript,</strong> and <strong>Javascript</strong> (<strong>Next.js</strong>).
                    </p>
                </div>
            )
        },
        {
            id: 'frontend-visuals',
            title: 'Who is responsible for the frontend design & visuals?',
            content: (
                <div>
                    <p className="mb-4">
                        <strong>Bala Ravikumar is primarily responsible for programming the site frontend.</strong> We have worked extensively together to “get the design right” and iron out small details, leading to a web-app that we hope you will enjoy using. Please let us know if you have any design feedback or suggestions. While we are proud of the site, we’re always trying to make improvements.                    </p>

                </div>
            )
        },
        {
            id: 'further-questions',
            title: 'Who can I reach out to if I have any further questions?',
            content: (
                <div>
                    <p className="mb-4">
                        If you have any questions, please feel free to reach out to <strong>Max Savin</strong> via mes9950@stern.nyu.edu or <a href="https://x.com/supersayansavin" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">@supersayansavin</a> on X. Additionally, you can reach <strong>Mike Gribanov</strong> – founder of the NBA Draft Internet Consensus – via <a href="https://x.com/supersayansavin" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">@mikegrib8</a> on X.
                    </p>
                </div>
            )
        },
        {
            id: 'verify-board',
            title: 'How can I access or verify my board?',
            content: (
                <div>
                    <p className="mb-4">
                        If you’d like to review our copy of your board, please email mes9950@stern.nyu.edu or send a direct message to <a href="https://x.com/supersayansavin" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">@supersayansavin</a> or <a href="https://x.com/mikegrib8" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">@mikegrib8</a> on X.
                    </p>
                    <p className="mb-4">
                        We are very careful to process each board accurately, but acknowledge that mistakes can happen. If any inconsistencies are found, we’ll do our best to resolve them quickly. To ensure fairness, this process requires proof that your board was publicly shared before the draft – preventing any retroactive edits or revisions.
                    </p>
                </div>
            )
        },
        {
            id: 'remove-board',
            title: 'Can I retroactively remove my board from the consensus?',
            content: (
                <div>
                    <p className="mb-4">
                        If you want to anonymize or remove your board please email mes9950@stern.nyu.edu or send a direct message to <a href="https://x.com/supersayansavin" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">@supersayansavin</a> or <a href="https://x.com/mikegrib8" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">@mikegrib8</a> on X.
                    </p>
                    <p className="mb-4">
                        We prefer to anonymize boards rather than remove them entirely, but – within reason – we are committed to honoring individual requests and preferences. We do not intend to include or evaluate any independent boards against the stated preference of their creator. From our perspective, boards published by or associated with major organizations are, generally, treated as part of the public record.
                    </p>
                    <p>
                        Starting with TPM’s involvement in 2025, we began collecting explicit consent via our board submission form. For earlier classes, or for public boards not submitted directly, we remain willing to anonymize or remove boards retroactively at the creator’s request.
                    </p>
                </div>
            )
        },
    ];

    return (
        <div className="min-h-screen bg-[#19191A]">
            <NavigationHeader activeTab="" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
                        FAQs
                    </h1>
                    <p className="text-gray-300 mb-4">Learn about the NBA Draft Internet Consensus via frequently asked questions        </p>
                    <p className="text-gray-300 mb-4">Written by Max Savin</p>
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