//
//  Robot.swift
//  Arthrobots
//
//  Created by Paul Carduner on 12/13/14.
//  Copyright (c) 2014 Paul Carduner. All rights reserved.
//

import Foundation

public enum ABDirection {
    case NORTH
    case SOUTH
    case EAST
    case WEST
}

let ABRobotOffset = [
    ABDirection.NORTH: (0,  1),
    ABDirection.SOUTH: (0, -1),
    ABDirection.EAST:  (1,  0),
    ABDirection.WEST:  (-1, 0),
]

public class ABRobot {
    public var x = 1;
    public var y = 1;
    public var direction = ABDirection.NORTH;
    public var beepers = 0;
    public var on = true;
}