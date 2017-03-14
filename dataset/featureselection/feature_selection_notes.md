
# Feature Selection Notes (report)

Audio files are a few seconds long. Sampled in 10MS frames; silent frames were pruned (had 0 value). That is, data is per frame, not per note. This is what we want to score.

We keep the full (huge) dataset, but trim the features. We attempt to remove redundant and/or irrelevant features.

This can be done via domain knowledge or systematic approaches to find the data set that offers the best performance.

**We don't do domain knowledge; We do 3 systematic tests**

There are 3 systematic approaches: embedded, filter-based, or wrapper. We don't do embedded (taken care of naturally in the classifier).

Wrapper tests target a specific type of classifier, and embedded tests are naturally handled during execution of certain types of classifiers, like decision trees.

We approach feature selection by running 3 filter-based tests: Pearson's coefficient, Entropy, and Learner-based feature selection.

*Note: the feature selection output files are included in this repo*

## Filter-based

* Use independent features / suppress the least interesting

* Uses a statistical measure to score the relevance. We do so by evaluating CORRELATION using pearson's correlation, and entropy. Both of these techniques are part of the WEKA tool.

### Pearson's Coefficient Based Feature Selection

* Correlation between each value & output

* Drop those below a correlation threshold. We want values that are medium-high

Based our our results, choosing a threshold of 0.02, we eliminate 27 features.
**Result**: use 36 / 63 features *... generated*

Choosing a threshold of 0.03, we eliminate 36 features.
**Result**: use 27 / 63 

Filter result file: pearson_coefficient.arff

### Information Gain / Entropy Based Feature Selection

* More info == more gain == more use; remove low entropy has they dont add anything

Choosing a threshold of 0.05; we eliminate too many
**Result:** use 13 / 63 

Choosing a threshold of 0.3; approximately half
**Result:** use 30 / 63 

Filter result file: entropy.arff

### Learner-based Based Feature Selection

WEKA Suggested the values (no threshold)
**Result:** 27 / 63 

Filter result file: learner_based.arff

## Results

The chosen attributes were each used on a 5-Fold Random Tree to classify. The results are summed in the table below, and the output files can be found in the repository.

| Filter Type | Threshold Value | Number of Attributes | Correctly Classified Instances | Modified data file | Output file |
| --- | --- | --- | --- | --- | --- |
| Pearson | 0.03 | 27 / 63 | 87.2597 | MARSAYAS_...pearson_03.arff | pearson_03_randomtree.arff |
| Pearson | 0.02 | 36 / 63 | 87.8306 | MARSAYAS_...pearson_02.arff | pearson_02_randomtree.arff |
| Entropy | 0.05 | 36 / 63 | 86.8748 | MARSAYAS_...entropy_05.arff | entropy_05_randomtree.arff |
| Entropy | 0.03 | 31 / 63 | 87.6285 | MARSAYAS_...entropy_03.arff | entropy_03_randomtree.arff  |
| Learner-based | (null) | 27 / 63 | 87.8594 | MARSAYAS_...learner_0.arff | learner_0_randomtree.arff |

Comparing the 5 files, we can see that the XXX feature subset selection is the best. Their full summaries are below.

//// pearson_03_randomtree
=== Stratified cross-validation ===
=== Summary ===

Correctly Classified Instances      103154               87.2597 %
Incorrectly Classified Instances     15061               12.7403 %
Kappa statistic                          0.8701
Mean absolute error                      0.0029
Root mean squared error                  0.0538
Relative absolute error                 12.9884 %
Root relative squared error             50.9676 %
Total Number of Instances           118215

//// pearson_02_randomtree
=== Stratified cross-validation ===
=== Summary ===

Correctly Classified Instances      103829               87.8306 %
Incorrectly Classified Instances     14386               12.1694 %
Kappa statistic                          0.8759
Mean absolute error                      0.0028
Root mean squared error                  0.0526
Relative absolute error                 12.4063 %
Root relative squared error             49.8124 %
Total Number of Instances           118215     


// entrroy_03_randomtree
=== Stratified cross-validation ===
=== Summary ===
Correctly Classified Instances      103590               87.6285 %
Incorrectly Classified Instances     14625               12.3715 %
Kappa statistic                          0.8739
Mean absolute error                      0.0028
Root mean squared error                  0.053 
Relative absolute error                 12.6124 %
Root relative squared error             50.2244 %
Total Number of Instances           118215 

// entropy_05_randomtree
=== Stratified cross-validation ===
=== Summary ===
Correctly Classified Instances      102699               86.8748 %
Incorrectly Classified Instances     15516               13.1252 %
Kappa statistic                          0.8662
Mean absolute error                      0.003 
Root mean squared error                  0.0546
Relative absolute error                 13.3808 %
Root relative squared error             51.7317 %
Total Number of Instances           118215  

//learner_randomtree
=== Stratified cross-validation ===
=== Summary ===

Correctly Classified Instances      103863               87.8594 %
Incorrectly Classified Instances     14352               12.1406 %
Kappa statistic                          0.8762
Mean absolute error                      0.0028
Root mean squared error                  0.0525
Relative absolute error                 12.3769 %
Root relative squared error             49.7535 %
Total Number of Instances           118215   



## RESOURCES


[1] "Filter-based Feature Selection" https://msdn.microsoft.com/en-us/library/azure/dn905854.aspx

[2] "Title" http://machinelearningmastery.com/perform-feature-selection-machine-learning-data-weka/

[3] "Pearson Correlation Coefficient" https://en.wikipedia.org/wiki/Pearson_correlation_coefficient

