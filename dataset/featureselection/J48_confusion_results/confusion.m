% SENG 474
% Data Mining | Confusion Matrix Analysis
% Author: Erika Burdon
% V00 723 693
%
% Reads in confusion matrix data for each PN dataset for the J48 
% classifier, and finds the greatest intersection of mismatched data.
% In other words, finds the most problematic note.

filename = '/home/erika/Desktop/p1_original_confusion.csv';
% filename = '/home/erika/Desktop/p1_learner_confusion.csv';
% filename = '/home/erika/Desktop/p1_entropy_03_confusion.csv';
% filename = '/home/erika/Desktop/p1_entropy_05_confusion.csv';
% filename = '/home/erika/Desktop/p1_pearson_02_confusion.csv';
% filename = '/home/erika/Desktop/p1_pearson_03_confusion.csv';

data = csvread(filename);
[m,n] = size(data);

max = 0;
maxx = 0;
maxy = 0;

for iterx = 1:m
    for itery = 1:(n-1)
        % Skip diagonal
        if iterx ~= itery
            if data(iterx, itery) > max
                max = data(iterx, itery);
                maxx = iterx;
                maxy = itery;
            end
        end
    end
end

disp('Highest misclassified note at x y position:')
disp(maxx)
disp(maxy)
disp('with value of:')
disp(max)
