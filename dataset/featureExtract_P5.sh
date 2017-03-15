#!/bin/bash
#ls */*/RAND/*/*/P5/MAPS_RAND_P5*.wav > p5.mf
#bextract p5.mf -w p5.arff
#sed -i.bak '/0.000000,0.000000,0.000000,0.000000/d' ./MARSYAS_EMPTYp5.arff

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
        IFS5=' ' read -r -a n5 <<< `sed '6q;d' $textfile`
        m='m'
        class1=$(echo "$m${n1[2]}" | tr -d '\040\011\012\015')
        class2=$(echo "$m${n2[2]}" | tr -d '\040\011\012\015')
        class3=$(echo "$m${n3[2]}" | tr -d '\040\011\012\015')
        class4=$(echo "$m${n4[2]}" | tr -d '\040\011\012\015')
        class5=$(echo "$m${n5[2]}" | tr -d '\040\011\012\015')
        classes=$class1','$class2','$class3','$class4','$class5
     else
        p="${p/p5/$classes}"
     fi
     echo $p >> MARSYAS_EMPTYp5_output.arff
done <MARSYAS_EMPTYp5.arff


