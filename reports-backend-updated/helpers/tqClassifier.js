// tqClassifier.js
function classifyTQ(value) {
    if (value >= 130) {
      return { old: "Very Superior level of intelligence", wiscV: "Extremely High" };
    } else if (value >= 120) {
      return { old: "Superior level of intelligence", wiscV: "Very High" };
    } else if (value >= 110) {
      return { old: "High Average level of intelligence", wiscV: "High Average" };
    } else if (value >= 90) {
      return { old: "Average level of intelligence", wiscV: "Average" };
    } else if (value >= 80) {
      return { old: "Low Average level of intelligence", wiscV: "Low Average" };
    } else if (value >= 70) {
      return { old: "Borderline level of intelligence", wiscV: "Very Low" };
    } else if (value >= 60) {
      return { old: "Low level of intelligence", wiscV: "Extremely Low" };
    } else {
      return { old: "Extremely low level of intelligence", wiscV: "Extremely Low" };
    }
  }
  
module.exports = classifyTQ;
  