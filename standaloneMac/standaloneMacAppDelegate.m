//
//  standaloneMacAppDelegate.m
//  standaloneMac
//
//  Created by krisoft on 4/26/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import "standaloneMacAppDelegate.h"

@implementation standaloneMacAppDelegate

@synthesize window;
@synthesize goSite;
@synthesize logs;
@synthesize webAddres;

- (void)applicationDidFinishLaunching:(NSNotification *)aNotification {
	// Insert code here to initialize your application 
		[[NSNotificationCenter defaultCenter] addObserver: self selector:@selector(dataIsAvailable:)
												 name:NSFileHandleDataAvailableNotification object: nil];
		[self startServer];
}

- (void)dataIsAvailable:(NSNotification *) aNotif{
	NSData *data;
	data = [outputFile availableData];
	NSString *string;
	string = [[NSString alloc] initWithData: data
								   encoding: NSUTF8StringEncoding];
	printf ("%s", [string cStringUsingEncoding:NSUTF8StringEncoding]);
	[[[logs textStorage] mutableString] appendString: string];
	if([nodeServer isRunning]){
		[outputFile waitForDataInBackgroundAndNotify];
	}
}

-(void)startServer{
	nodeServer = [[NSTask alloc] init];
	NSString* nodePath=[[NSBundle mainBundle] pathForResource:@"node" ofType:@""];
	[nodeServer setLaunchPath: nodePath];
	
	NSString* codePath=[[NSBundle mainBundle] pathForResource:@"server" ofType:@"js"];
	NSString* webRoot=[NSString stringWithFormat:@"%@/../webroot/",[[NSBundle mainBundle] bundlePath]];
	NSString* webRootE = (NSString *)CFURLCreateStringByAddingPercentEscapes(
																				   NULL,
																				   (CFStringRef)webRoot,
																				   NULL,
																				   (CFStringRef)@"!*'();:@&=+$,/?%#[]",
																				   kCFStringEncodingUTF8 );
	
	NSArray *arguments;
	arguments = [NSArray arrayWithObjects: codePath,webRootE,webRoot, nil];
	[nodeServer setArguments: arguments];
	
	pipe = [NSPipe pipe];
	[nodeServer setStandardOutput: pipe];
	[nodeServer setStandardError: pipe];
	
	spipe = [NSPipe pipe];
	[nodeServer setStandardInput:spipe];
	soutputFile = [spipe fileHandleForReading];
	
	
	outputFile = [pipe fileHandleForReading];
	[outputFile waitForDataInBackgroundAndNotify];
	
	[nodeServer launch];
}

-(IBAction) openPage: (id) sender{
	[[NSWorkspace sharedWorkspace] openURL:[NSURL URLWithString:@"http://localhost:8002/"]];
}

@end
