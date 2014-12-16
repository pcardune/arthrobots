//
//  ViewController.swift
//  Arthrobots
//
//  Created by Paul Carduner on 12/13/14.
//  Copyright (c) 2014 Paul Carduner. All rights reserved.
//

import UIKit
import Parse
import ParseUI

class ViewController: UIViewController, PFLogInViewControllerDelegate, PFSignUpViewControllerDelegate {

    @IBOutlet weak var usernameLabel: UILabel!
    @IBOutlet weak var worldCanvas: WorldCanvasView!

    override func viewDidAppear(animated: Bool) {
        super.viewDidAppear(animated)
        showLoginViewController()
    }
    
    func showLoginViewController() {
        if (PFUser.currentUser() == nil) {
            var loginViewController = PFLogInViewController()
            loginViewController.delegate = self
            loginViewController.fields = (
                PFLogInFields.Twitter |
                    PFLogInFields.Facebook |
                    PFLogInFields.DismissButton |
                    PFLogInFields.SignUpButton |
                    PFLogInFields.UsernameAndPassword |
                    PFLogInFields.LogInButton
            )
            var signupViewController = PFSignUpViewController()
            signupViewController.delegate = self
            loginViewController.signUpController = signupViewController
            presentViewController(loginViewController, animated: true, completion: nil)
        }
    }
    
    func logInViewController(logInController: PFLogInViewController!, shouldBeginLogInWithUsername username: String!, password: String!) -> Bool {
        if (username != nil && password != nil && countElements(username) != 0 && countElements(password) != 0) {
            return true
        }
        var alert = UIAlertView(title: "Missing Information", message: "Make sure you fill out all the information!", delegate: nil, cancelButtonTitle: "OK")
        alert.show()
        return false
    }
    
    func logInViewController(logInController: PFLogInViewController!, didLogInUser user: PFUser!) {
        updateViews()
        dismissViewControllerAnimated(true, completion: nil)
    }
    
    func logInViewController(logInController: PFLogInViewController!, didFailToLogInWithError error: NSError!) {
        NSLog("Failed to log in...")
    }
    
    func logInViewControllerDidCancelLogIn(logInController: PFLogInViewController!) {
        navigationController?.popViewControllerAnimated(true)
    }
    
    @IBAction func didTouchLogoutButton(sender: AnyObject) {
        if PFUser.currentUser() != nil {
            PFUser.logOut()
            NSLog("Logged out user")
            showLoginViewController()
        }
    }
    
    func updateViews() {
        if PFUser.currentUser() != nil {
            usernameLabel.text = PFUser.currentUser().username
        }
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        worldCanvas.world = ABWorld()
        worldCanvas.backgroundColor = UIColor.grayColor()
        updateViews()
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

}

