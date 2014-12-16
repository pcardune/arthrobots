//
//  ProgramEditorViewController.swift
//  Arthrobots
//
//  Created by Paul Carduner on 12/14/14.
//  Copyright (c) 2014 Paul Carduner. All rights reserved.
//

import Foundation
import UIKit
import Parse

class ProgramEditorViewController : UIViewController {

    var worldModel:PFObject! = nil

    @IBOutlet weak var worldNameLabel: UILabel!
    @IBOutlet weak var worldCanvas: WorldCanvasView!

    required init(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        worldNameLabel.text = worldModel["name"] as NSString
        let definition = worldModel["definition"] as String
        let parser = ABWorldParser(lines: split(definition, {$0 == "\n"}), world: worldCanvas.world!)
        parser.parse()
    }
}