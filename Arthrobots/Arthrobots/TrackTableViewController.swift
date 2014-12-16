//
//  TrackTableViewController.swift
//  Arthrobots
//
//  Created by Paul Carduner on 12/14/14.
//  Copyright (c) 2014 Paul Carduner. All rights reserved.
//

import Foundation
import UIKit
import Parse
import ParseUI

class TrackTableViewController : PFQueryTableViewController {
    
    required init(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        parseClassName = "TrackModel"
        textKey = "name"
        pullToRefreshEnabled = true
        paginationEnabled = false
        objectsPerPage = 25
    }
    
    override func tableView(tableView: UITableView!, cellForRowAtIndexPath indexPath: NSIndexPath!, object: PFObject!) -> PFTableViewCell! {
        let cellIdentifier = "cell";
        
        var cell:PFTableViewCell! = tableView.dequeueReusableCellWithIdentifier(cellIdentifier, forIndexPath: indexPath) as PFTableViewCell
        if cell == nil {
            cell = PFTableViewCell(style: UITableViewCellStyle.Subtitle, reuseIdentifier: cellIdentifier)
        }
        
        // Configure the cell to show todo item with a priority at the bottom
        cell.textLabel?.text = object[textKey] as NSString
        cell.detailTextLabel?.text = "foo"
        return cell;
    }
    
    override func tableView(tableView: UITableView, didDeselectRowAtIndexPath indexPath: NSIndexPath) {
        super.tableView(tableView, didDeselectRowAtIndexPath: indexPath)
        var object:PFObject! = self.objectAtIndexPath(indexPath) as PFObject
    }
    
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        super.prepareForSegue(segue, sender: sender)
        let path = tableView.indexPathForSelectedRow()!
        let worldTableViewController = segue.destinationViewController as WorldTableViewController
        worldTableViewController.trackModel = self.objectAtIndexPath(path)
    }
}