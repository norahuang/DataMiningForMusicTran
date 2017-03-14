
# Feature Selection Notes (report)

Audio files are a few seconds long. Sampled in 10MS frames; silent frames were pruned (had 0 value). That is, data is per frame, not per note. This is what we want to score.

We keep the full (huge) dataset, but trim the features. We attempt to remove redundant and/or irrelevant features.

This can be done via domain knowledge or systematic approaches to find the data set that offers the best performance.

**We don't do domain knowledge**

There are 3 systematic approaches: embedded, filter-based, or wrapper. We don't do embedded (taken care of naturally in the classifier).

## Filter-based

* Use independent features / suppress the least interesting

* Uses a statistical measure to score the relevance. We do so by evaluating CORRELATION using pearson's correlation, and entropy. Both of these techniques are part of the WEKA tool.

*Note: the feature selection output files are included in this repo*

### Pearson's Coefficient

* Correlation between each value & output

* Drop those below a correlation threshold. We want values that are medium-high

Based our our results, choosing a threshold of 0.02, we eliminate 27 features.
**Result**: use 36 / 63 features *... generated*

Choosing a threshold of 0.03, we eliminate 36 features.
**Result**: use 27 / 63 *... generated*

### Information Gain / Entropy

* More info == more gain == more use; remove low entropy has they dont add anything

Choosing a threshold of 0.05; we eliminate too many
**Result:** use 13 / 63 ... **Erika TODO**

Choosing a threshold of 0.3; approximately half
**Result:** use 30 / 63 ... **Erika TODO**

### Learner-based

**Erika TODO**
*Incomplete: I need more time to run. I attempted 30 minutes of letting weka run; had to cancel and go to class.*

**We try 3 systematic approaches**

... Results here?


## RESOURCES


[1] "Filter-based Feature Selection" https://msdn.microsoft.com/en-us/library/azure/dn905854.aspx

[2] "Title" http://machinelearningmastery.com/perform-feature-selection-machine-learning-data-weka/

[3] "Pearson Correlation Coefficient" https://en.wikipedia.org/wiki/Pearson_correlation_coefficient

