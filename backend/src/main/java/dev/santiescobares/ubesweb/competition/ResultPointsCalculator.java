package dev.santiescobares.ubesweb.competition;

import lombok.experimental.UtilityClass;

@UtilityClass
public class ResultPointsCalculator {

    // TODO make them editable in application.yaml
    public int calculatePoints(int positionNumber) {
        if (positionNumber <= 0) {
            throw new IllegalArgumentException("Position number must be greater than 0");
        }
        return switch (positionNumber) {
            case 1 -> 100;
            case 2 -> 50;
            case 3 -> 25;
            case 4 -> 10;
            case 5 -> 5;
            default -> 1;
        };
    }
}
