//
//  WorldTableViewController.swift
//  Arthrobots
//
//  Created by Paul Carduner on 12/14/14.
//  Copyright (c) 2014 Paul Carduner. All rights reserved.
//

import Foundation
import ParseUI
import Parse

class WorldTableViewController : PFQueryTableViewController {
    
    var trackModel:PFObject! = nil

    required init(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        parseClassName = "WorldModel"
        textKey = "name"
        pullToRefreshEnabled = true
        paginationEnabled = true
        objectsPerPage = 25
    }
    
    override func queryForTable() -> PFQuery! {
        let query = PFQuery(className: parseClassName)
        if pullToRefreshEnabled {
            query.cachePolicy = kPFCachePolicyNetworkOnly
        }
        if countElements(objects) == 0 {
            query.cachePolicy = kPFCachePolicyCacheThenNetwork
        }
        query.orderByAscending("order")
        query.whereKey("track", equalTo:trackModel)
        return query
    }
    
    override func tableView(tableView: UITableView!, cellForRowAtIndexPath indexPath: NSIndexPath!, object: PFObject!) -> PFTableViewCell! {
        let cellIdentifier = "cell";
        
        var cell:PFTableViewCell! = tableView.dequeueReusableCellWithIdentifier(cellIdentifier, forIndexPath: indexPath) as PFTableViewCell
        if cell == nil {
            cell = PFTableViewCell(style: UITableViewCellStyle.Subtitle, reuseIdentifier: cellIdentifier)
        }
        
        // Configure the cell to show todo item with a priority at the bottom
        cell.textLabel?.text = object[textKey] as NSString
        return cell;
    }
    
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        super.prepareForSegue(segue, sender: sender)
        let path = tableView.indexPathForSelectedRow()!
        let programEditorVC = segue.destinationViewController as ProgramEditorViewController
        programEditorVC.worldModel = self.objectAtIndexPath(path)
    }
}