//
//  ABWorldParser.swift
//  Arthrobots
//
//  Created by Paul Carduner on 12/14/14.
//  Copyright (c) 2014 Paul Carduner. All rights reserved.
//

import Foundation


let SPEC = "/^\\s*(\\w+)\\s+(\\d+)\\s+(\\d+)\\s+([NESW])(\\s+\\d+)?\\s*$/"
let BEEPERS = "/^\\s*(\\w+)\\s+(\\d+)\\s+(\\d+)\\s+(\\d+)\\s*$/";
let EMPTY_LINE = "/^\\s*$/"
let COMMENT = "/^([^#]*)#?.*/"

public class ABWorldParser {
    var lines:[String]
    var world:ABWorld

    public init(lines:[String], world:ABWorld) {
        self.lines = lines
        self.world = world
    }

    func removeComment(line:String) -> String! {
        var error:NSError?;
        let regex = NSRegularExpression(pattern: COMMENT, options: NSRegularExpressionOptions.allZeros, error: &error)
        
        return regex?.stringByReplacingMatchesInString(
            line,
            options: NSMatchingOptions.allZeros,
            range: NSRangeFromString(line),
            withTemplate: "")
    }

    func parse() {
        var error:NSError?
        let emptyRegex = NSRegularExpression(
            pattern: EMPTY_LINE,
            options: NSRegularExpressionOptions.allZeros,
            error: &error)
        let beepersRegex = NSRegularExpression(
            pattern: BEEPERS,
            options: NSRegularExpressionOptions.allZeros,
            error: &error)
        let specRegex = NSRegularExpression(
            pattern: SPEC,
            options: NSRegularExpressionOptions.allZeros,
            error: &error)
        let directionMap = [
            "N":ABDirection.NORTH,
            "S":ABDirection.SOUTH,
            "E":ABDirection.EAST,
            "W":ABDirection.WEST]
        var name:String, xCoord:Int, yCoord:Int, count:Int, direction:ABDirection!
        for i in 1...countElements(lines) {
            var line = removeComment(lines[i-1])
            var nsLine = line as NSString
            let emptyMatch = emptyRegex?.numberOfMatchesInString(
                line,
                options: NSMatchingOptions.allZeros,
                range: NSRangeFromString(line))
            if emptyMatch > 0 {
                continue
            }
            var specMatch = specRegex?.matchesInString(line, options: NSMatchingOptions.allZeros, range: NSRangeFromString(line)) as [NSTextCheckingResult]
            
            if countElements(specMatch) > 0{
                name = nsLine.substringWithRange(specMatch[1].range).uppercaseString
                xCoord = nsLine.substringWithRange(specMatch[2].range).toInt()!
                yCoord = nsLine.substringWithRange(specMatch[3].range).toInt()!
                var direction = directionMap[nsLine.substringWithRange(specMatch[4].range)]!;
                count = nsLine.substringWithRange(specMatch[5].range).toInt()!
                if (name == "ROBOT"){
                    world.robot.x = xCoord;
                    world.robot.y = yCoord;
                    world.robot.beepers = count;
                    world.robot.direction = direction;
                }
                if (name == "WALL"){
                    world.setWall(xCoord, y: yCoord, direction: direction, count: count);
                }
            }
            var beepersMatch = beepersRegex?.matchesInString(line, options: NSMatchingOptions.allZeros, range:NSRangeFromString(line)) as [NSTextCheckingResult]
            if countElements(beepersMatch) > 0 {
                name = nsLine.substringWithRange(beepersMatch[1].range).uppercaseString
                if (name == "BEEPERS"){
                    xCoord = nsLine.substringWithRange(specMatch[2].range).toInt()!
                    yCoord = nsLine.substringWithRange(specMatch[3].range).toInt()!
                    count = nsLine.substringWithRange(specMatch[4].range).toInt()!
                    world.setBeepers(xCoord, y: yCoord, amount: count);
                }
            }
            
        }
        
    }
}