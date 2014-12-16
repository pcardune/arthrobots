//
//  WorldCanvasView.swift
//  Arthrobots
//
//  Created by Paul Carduner on 12/13/14.
//  Copyright (c) 2014 Paul Carduner. All rights reserved.
//

import Foundation
import UIKit

class WorldCanvasView: UIView {

    required init(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }

    var world:ABWorld? = ABWorld();
    var startX = 1;
    var startY = 1;
    var endX = 12;
    var endY = 12;
    var scale = 20;
    
    func getCanvasCoords(x:Int, y:Int) -> (CGFloat, CGFloat){
        return (CGFloat(x)*CGFloat(scale), CGFloat(y)*CGFloat(scale))
    }
    
    func drawBoundaries() {
        var (sx, sy) = getCanvasCoords(startX, y: startY)
        var (ex, ey) = getCanvasCoords(endX, y: endY)
        let context = UIGraphicsGetCurrentContext()
        CGContextSetFillColorWithColor(context, UIColor.blueColor().CGColor)
        // horizontal boundary
        CGContextFillRect(context, CGRect(x: sx, y: bounds.height - sy, width: ex, height: 2))
        // vertical boundary
        CGContextFillRect(context, CGRect(x: sx, y: bounds.height - sy, width: 2, height: -ey))
    }
    
    func drawCorners() {
        let context = UIGraphicsGetCurrentContext()
        CGContextSetFillColorWithColor(context, UIColor.blackColor().CGColor)
        CGContextMoveToPoint(context, 0, 0)
        for x in 2...(endX-startX+1) {
            for y in 2...(endY-startY+1) {
                var (cx, cy) = getCanvasCoords(x,y:y);
                CGContextFillRect(context, CGRect(x: cx, y: bounds.height - cy, width: 4, height: 4))
            }
        }
    }
    
    func drawRobot() {
        let context = UIGraphicsGetCurrentContext()
        CGContextSetFillColorWithColor(context, UIColor.whiteColor().CGColor)
        CGContextSetLineWidth(context, 2)
        CGContextSetStrokeColorWithColor(context, UIColor.redColor().CGColor)
        
        if (world != nil) {
            var (cx, cy) = getCanvasCoords(world!.robot.x, y: world!.robot.y)
            CGContextTranslateCTM(context, cx+CGFloat(scale)/2.0, bounds.height - cy-CGFloat(scale)/2.0)
            CGContextRotateCTM(context, 3.14159)
            var padding = CGFloat(scale)*0.2;
            CGContextMoveToPoint(context, -CGFloat(scale)/2.0+padding, -CGFloat(scale)/2.0+padding)
            CGContextAddLineToPoint(context, CGFloat(scale)/2-padding, -CGFloat(scale)/2+padding)
            CGContextAddLineToPoint(context, 0, CGFloat(scale)/2-padding)
            CGContextAddLineToPoint(context, -CGFloat(scale)/2.0+padding, -CGFloat(scale)/2.0+padding)
            CGContextStrokePath(context)
            
            CGContextSetFillColorWithColor(context, UIColor.blueColor().CGColor)
            CGContextFillEllipseInRect(context, CGRect(x: -2, y: -2, width: 4, height: 4))
        }
    }

    override func drawRect(rect: CGRect) {
        super.drawRect(rect)
        let context = UIGraphicsGetCurrentContext()
        drawBoundaries()
        drawCorners()
        drawRobot()
    }
}