//
//  standaloneMacAppDelegate.h
//  standaloneMac
//
//  Created by krisoft on 4/26/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import <Cocoa/Cocoa.h>

@interface standaloneMacAppDelegate : NSObject <NSApplicationDelegate> {
    NSWindow *window;
	NSPipe *pipe;
	NSPipe *spipe;
	NSTask *nodeServer;
	NSButton *goSite;
	NSTextView *logs;
	NSTextField *webAddres;
	NSFileHandle *outputFile;
	NSFileHandle *soutputFile;
}

@property (assign) IBOutlet NSWindow *window;
@property (assign) IBOutlet NSButton *goSite;
@property (assign) IBOutlet NSTextView *logs;
@property (assign) IBOutlet NSTextField *webAddres;

-(IBAction) openPage: (id) sender;

- (void)dataIsAvailable:(NSNotification *) aNotif;
-(void)startServer;


@end
