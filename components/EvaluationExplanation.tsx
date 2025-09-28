import React, { useState } from 'react';
import { ChevronDown, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EvaluationExplanationProps {
    selectedYear: '2025' | '2024' | '2023' | '2022' | '2021' | '2020';
    consensusFilter: 'lottery' | 'top30' | 'top60';
}

const EvaluationExplanation: React.FC<EvaluationExplanationProps> = ({
    selectedYear,
    consensusFilter
}) => {
    const [isBaselineBoardsExpanded, setIsBaselineBoardsExpanded] = useState(false);
    const [isEvaluationCriteriaExpanded, setIsEvaluationCriteriaExpanded] = useState(false);

    // Get the parameter name based on consensus filter
    const getParameterName = () => {
        switch (consensusFilter) {
            case 'lottery': return 'Lottery';
            case 'top30': return 'Top 30';
            case 'top60': return 'Top 60';
            default: return 'Lottery';
        }
    };

    // Get the number of boards based on year (you'll need to adjust these numbers based on your actual data)
    const getBoardCount = () => {
        switch (selectedYear) {
            case '2025': return 164; // Adjust based on actual count
            case '2024': return 111;
            case '2023': return 71;
            case '2022': return 100;
            case '2021': return 104;
            case '2020': return 63;
            default: return 15;
        }
    };

    // Check if year has evaluation data
    const hasEvaluationData = () => {
        return true;
    };

    // Check if year needs "progress report" caveat
    const needsProgressCaveat = () => {
        return ['2024', '2023', '2022'].includes(selectedYear);
    };

    const parameter = getParameterName();
    const boardCount = getBoardCount();

    return (
        <div className="max-w-6xl mx-auto px-4 mb-2 pt-2.5">
            <div className="space-y-1">
                {/* Baseline Boards Section */}
                <div className="bg-[#19191A] overflow-hidden">
                    <button
                        onClick={() => setIsBaselineBoardsExpanded(!isBaselineBoardsExpanded)}
                        className="w-full px-2 py-0.1 flex items-center justify-between bg-[#19191A] transition-colors"
                    >
                        <div className="flex items-center gap-1">
                            <h3 className={`text-sm transition-colors ${isBaselineBoardsExpanded ? 'text-white' : 'text-gray-400'}`}>
                                Baseline Boards
                            </h3>
                            <div>
                                {isBaselineBoardsExpanded ?
                                    <Minus className={`w-3 h-3 transition-colors ${isBaselineBoardsExpanded ? 'text-white' : 'text-gray-400'}`} /> :
                                    <Plus className={`w-3 h-3 transition-colors ${isBaselineBoardsExpanded ? 'text-white' : 'text-gray-400'}`} />
                                }
                            </div>
                        </div>
                    </button>

                    <AnimatePresence>
                        {isBaselineBoardsExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="overflow-hidden"
                            >
                                <div className="px-2 py-2 text-gray-300 space-y-2">
                                    <div className="text-sm leading-relaxed">
                                        <span className="font-bold text-white">Consensus</span> – represents the overall consensus board (aggregate of the {boardCount} individual boards that make up the {selectedYear} Consensus). This "board" is the rankings you see in card view and table view.
                                    </div>
                                    <div className="text-sm leading-relaxed">
                                        <span className="font-bold text-white">NBA</span> – represents the NBA's collective draft board. This "board" is the {selectedYear} NBA Draft results.
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Evaluation Criteria Section - Only show if has evaluation data */}
                {hasEvaluationData() && (
                    <div className="bg-[#19191A] overflow-hidden">
                        <button
                            onClick={() => setIsEvaluationCriteriaExpanded(!isEvaluationCriteriaExpanded)}
                            className="w-full px-2 py-2 flex items-center justify-between bg-[#19191A] transition-colors"
                        >
                            <div className="flex items-center gap-1">
                                <h3 className={`text-sm transition-colors ${isEvaluationCriteriaExpanded ? 'text-white' : 'text-gray-400'}`}>
                                    Evaluation Criteria
                                </h3>
                                <div>
                                    {isEvaluationCriteriaExpanded ?
                                        <Minus className={`w-3 h-3 transition-colors ${isEvaluationCriteriaExpanded ? 'text-white' : 'text-gray-400'}`} /> :
                                        <Plus className={`w-3 h-3 transition-colors ${isEvaluationCriteriaExpanded ? 'text-white' : 'text-gray-400'}`} />
                                    }
                                </div>
                            </div>
                        </button>

                        <AnimatePresence>
                            {isEvaluationCriteriaExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-2 py-0.1 text-gray-300 space-y-3">
                                        <div className="space-y-2 text-sm leading-relaxed">
                                            <div>
                                                <span className="font-bold text-white">Consensus</span> – how aligned was each board's {parameter} with consensus?<br />
                                                <span className="text-white">lower value = more aligned</span> (weighted error)
                                            </div>
                                            <div>
                                                <span className="font-bold text-white">NBA Draft</span> – how aligned was each board's {parameter} with the {selectedYear} NBA Draft results?<br />
                                                <span className="text-white">higher value = more aligned</span> (correlation)
                                            </div>
                                            <div>
                                                <span className="font-bold text-white">Redraft</span> – how predictive was each board's {parameter} according to our 2025 redraft? (using draft pick value charts from Kevin Pelton & Jacob Goldstein)<br />
                                                <span className="text-white">lower value = more predictive</span> (opportunity cost – weighted error)
                                            </div>
                                            <div>
                                                <span className="font-bold text-white">EPM</span> – how predictive was each board's {parameter} according to career average Estimated Plus-Minus?<br />
                                                <span className="text-white">lower value = more predictive</span> (opportunity cost – weighted error)
                                            </div>
                                            <div>
                                                <span className="font-bold text-white">EW</span> – how predictive was each board's {parameter} according to career total Estimated Wins?<br />
                                                <span className="text-white">lower value = more predictive</span> (opportunity cost – weighted error)
                                            </div>
                                            <div>
                                                <span className="font-bold text-white">{parameter} Rank</span> – where does each board's {parameter} rank in terms of overall predictive value?
                                            </div>
                                        </div>

                                        {/* Methodology Note */}
                                        <p className="text-sm italic leading-relaxed">
                                            <span className="font-bold text-white">Think of each draft board as the order in which an analyst would have selected prospects if they, theoretically, controlled every pick in the draft</span>. The values you see for Redraft, EPM, & EW are measures of average opportunity cost. <span className="font-bold text-white">If the NBA had drafted exclusively from this analyst's board, on average, each team would have "lost" or missed out on ( ____ criteria), compared to the optimal (criteria) redraft order</span>.
                                        </p>
                                        <p className="text-sm mt-2">
                                            For further information, please refer to the <a href="https://tawnyparkmetrics.com/consensus-nba-draft-board-write-up" target="_blank" rel="noopener noreferrer" className='text-blue-400 hover:text-blue-300 underline'>Consensus Write-Up</a>.
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Divider Line */}
            <div className="mt-1 mb-1.5">
                <div className="border-t border-gray-600 w-36 ml-1"></div>
            </div>

            {/* Permanent Caveat Section */}
            <div className="text-gray-400 space-y-1 text-sm leading-relaxed px-2 italic">
                {selectedYear === '2025' ? (
                    <p>
                        Players from this draft class have not finished, even, one full NBA season. Therefore, there is <span className="font-bold text-white">not yet any evaluation data, only exploratory analysis</span> to help indicate which boards were most/least correlated with consensus and the NBA Draft results. NBA Draft 'Top 60' is really only Top 59 (one forfeited 2nd round pick).
                    </p>
                ) : selectedYear === '2020' || selectedYear === '2021' ? (
                    <p>
                        NBA Draft 'Top 60' is really only Top 58 (two forfeited 2nd round picks).
                    </p>
                ) : (
                    needsProgressCaveat() && (
                        <p>
                            Players from this draft class have not yet finished, even, their rookie contracts. Therefore, <span className="font-bold text-white">these evaluations are only a "progress report" and are not necessarily indicative of final board performance</span>. NBA Draft 'Top 60' is really only Top 58 (two forfeited 2nd round picks).
                        </p>
                    )
                )}
            </div>
        </div>
    );
};

export default EvaluationExplanation;