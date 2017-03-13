#!/bin/bash

#for i in `seq 21 108`;
#        do
#            cmd=`find . -path '*/*/ISOL/NO/*M'$i'*.wav' -type f >m$i.mf`
#        done 

cat m*.mf > m.mf
bextract -sv m*.mf -w m.arff

