#!/bin/bash
#ls */*/RAND/*/*/P2/MAPS_RAND_P2*.wav > p2.mf
#bextract p2.mf -w p2.arff
#sed -i.bak '/0.000000,0.000000,0.000000,0.000000/d' ./MARSYAS_EMPTYp2.arff

classes=''
while read p; do

    if [[ $p == *"filename"* ]]; then
        IFS=' ' read -r -a array <<< $p
        wavfile="${array[2]}"
        textfile="${wavfile/wav/txt}"
        IFS1=' ' read -r -a n1 <<< `sed '2q;d' $textfile`
        IFS2=' ' read -r -a n2 <<< `sed '3q;d' $textfile`
        m='m'
        class1=$(echo "$m${n1[2]}" | tr -d '\040\011\012\015')
        class2=$(echo "$m${n2[2]}" | tr -d '\040\011\012\015')
        classes=$class1','$class2
     else
        p="${p/p2/$classes}"
     fi
     echo $p >> MARSYAS_EMPTYp2_output.arff
done <MARSYAS_EMPTYp2.arff


