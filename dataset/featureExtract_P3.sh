#!/bin/bash
ls */*/RAND/*/*/P3/MAPS_RAND_P3*.wav > p3.mf
bextract p3.mf -w p3.arff
sed -i.bak '/0.000000,0.000000,0.000000,0.000000/d' ./MARSYAS_EMPTYp3.arff

classes=''
while read p; do

    if [[ $p == *"filename"* ]]; then
        IFS=' ' read -r -a array <<< $p
        wavfile="${array[2]}"
        textfile="${wavfile/wav/txt}"
        IFS1=' ' read -r -a n1 <<< `sed '2q;d' $textfile`
        IFS2=' ' read -r -a n2 <<< `sed '3q;d' $textfile`
        IFS3=' ' read -r -a n3 <<< `sed '4q;d' $textfile`
        m='m'
        class1=$(echo "$m${n1[2]}" | tr -d '\040\011\012\015')
        class2=$(echo "$m${n2[2]}" | tr -d '\040\011\012\015')
        class3=$(echo "$m${n3[2]}" | tr -d '\040\011\012\015')
        classes=$class1','$class2','$class3
     else
        p="${p/p3/$classes}"
     fi
     echo $p >> MARSYAS_EMPTYp3_output.arff
done <MARSYAS_EMPTYp3.arff


