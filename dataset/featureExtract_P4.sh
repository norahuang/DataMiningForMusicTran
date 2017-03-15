#!/bin/bash
ls */*/RAND/*/*/P4/MAPS_RAND_P4*.wav > p4.mf
bextract p4.mf -w p4.arff
sed -i.bak '/0.000000,0.000000,0.000000,0.000000/d' ./MARSYAS_EMPTYp4.arff

classes=''
while read p; do

    if [[ $p == *"filename"* ]]; then
        IFS=' ' read -r -a array <<< $p
        wavfile="${array[2]}"
        textfile="${wavfile/wav/txt}"
        IFS1=' ' read -r -a n1 <<< `sed '2q;d' $textfile`
        IFS2=' ' read -r -a n2 <<< `sed '3q;d' $textfile`
        IFS3=' ' read -r -a n3 <<< `sed '4q;d' $textfile`
        IFS4=' ' read -r -a n4 <<< `sed '5q;d' $textfile`
        m='m'
        class1=$(echo "$m${n1[2]}" | tr -d '\040\011\012\015')
        class2=$(echo "$m${n2[2]}" | tr -d '\040\011\012\015')
        class3=$(echo "$m${n3[2]}" | tr -d '\040\011\012\015')
        class4=$(echo "$m${n4[2]}" | tr -d '\040\011\012\015')
        classes=$class1','$class2','$class3','$class4
     else
        p="${p/p4/$classes}"
     fi
     echo $p >> MARSYAS_EMPTYp4_output.arff
done <MARSYAS_EMPTYp4.arff


