//
//  World.swift
//  Arthrobots
//
//  Created by Paul Carduner on 12/13/14.
//  Copyright (c) 2014 Paul Carduner. All rights reserved.
//

import Foundation

public class ABWorld {
    public var robot:ABRobot
    var walls = [String:[ABDirection:Bool]]()
    var beepers = [String:Int]()
    
    public init(){
        robot = ABRobot()
    }
    
    public func setBeepers(x:Int, y:Int, amount:Int) {
        beepers["\(x),\(y)"] = amount;
    }
    
    public func getBeepers(x:Int, y:Int) -> Int? {
        return beepers["\(x),\(y)"];
    }
    
    private func getWallCoordinates(var x:Int, var y:Int, var direction:ABDirection) -> (Int, Int, ABDirection) {
        if direction == .WEST {
            direction = .EAST
            x -= 1
        } else if direction == .SOUTH {
            direction = .NORTH
            y -= 1
        }
        return (x, y, direction)
    }
    
    public func setWall(var x:Int, var y:Int, var direction:ABDirection, count:Int?) {
        (x, y, direction) = getWallCoordinates(x, y: y, direction: direction)
        let key = "\(x),\(y)"
        if walls[key] == nil {
            walls[key] = [ABDirection.NORTH:false, ABDirection.EAST:false]
        }
        walls[key]![direction] = true
        if count != nil && count > 1 {
            var (ox, oy) = ABRobotOffset[direction]!;
            setWall(x+oy, y:y+ox, direction:direction, count:count!-1);
        }
    }
    
    public func getWall(var x:Int, var y:Int, var direction:ABDirection) -> Bool {
        (x, y, direction) = getWallCoordinates(x, y: y, direction: direction);
        var wall = walls["\(x),\(y)"];
        var hasWall:Bool = wall != nil;
        if hasWall {
            hasWall = wall![direction]!
        }
        let isEastBoundary:Bool = x == 0 && direction == ABDirection.EAST
        let isSouthBoundary:Bool = y == 0 && direction == ABDirection.NORTH
        return hasWall || isEastBoundary || isSouthBoundary
    }
    
    public func isEqualTo(world:ABWorld) -> Bool {
        var robotsEqual = (
            world.robot.x == robot.x &&
                world.robot.y == robot.y &&
                world.robot.direction == robot.direction
        );
        if !robotsEqual {
            return false;
        }
        for (key, count) in beepers {
            if world.beepers[key] != beepers[key] {
                return false;
            }
        }
        for (key, count) in world.beepers {
            if world.beepers[key] != beepers[key] {
                return false;
            }
        }
        return true;
    }
}