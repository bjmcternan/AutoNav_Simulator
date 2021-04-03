///<reference path=".\TSDef\p5.global-mode.d.ts" />

let smoothControl;
let img;
let screenWidth = 760;
let screenHeight = 380;
let screenBorderX = 20;
let screenBorderY = 20;
let worldWidth = 30; //Feet
let worldHeight = 15 //Feet
let DEFAULT_BRIGHTNESS = 255;
let ROLLOVER_BRIGHTNESS = 60;

function preload() {
  img = loadImage('assets/2021-slalom.png');
}
function setup() {
  image(img, 0, 0);
}

function setup() 
{
	createCanvas(800, 420);
  smoothControl = new SmoothControlPath();
}

function draw()
{
	background(220);
	image(img, 0, 0);

	smoothControl.draw();
}

function drawGrid() 
{
	stroke(200);
	fill(120);
	for (var x=-width; x < width; x+=40) {
		line(x, -height, x, height);
		text(x, x+1, 12);
	}
	for (var y=-height; y < height; y+=40) {
		line(-width, y, width, y);
		text(y, 1, y+12);
	}
}

function mousePressed()
{
	//smoothControl.addOrSelect(mouseX, mouseY);
	smoothControl.selectPose(mouseX, mouseY);
}

function mouseReleased()
{
	smoothControl.deselectPose();
}

function mouseDragged()
{
	smoothControl.updatePoses(mouseX, mouseY);
}

function keyPressed() 
{
	if (keyCode === DELETE) 
	{
		smoothControl.deletePose();
	}
}

class SmoothControlPath
{
	constructor()
	{
		this.poses = [];
		this.isSelected = false;
	}

	deletePose()
	{
		if(null == this.selectedPose)
		{
			print("No pose to delete. "+ x + ", " +y);
		}
		else
		{
			this.selectedPose;
		}
	}

	//Returns [x, y] in screen space (pixels)
	worldSpaceToScreenSpace(worldSpace)
	{
		let screenSpace = [];
		screenSpace[0] = (worldSpace[0]/worldWidth) * screenWidth + screenBorderX;
		screenSpace[1] = screenHeight - ((worldSpace[1]/worldHeight) * screenHeight) + screenBorderY;

		return screenSpace;
	}

	//Returns [x, y] in world space (feet)
	screenSpaceToWorldSpace(screenSpace)
	{
		let worldSpace = [];
		worldSpace[0] = ((screenSpace[0] - screenBorderX)/screenWidth) * worldWidth;
		worldSpace[1] = worldHeight - (((screenSpace[1]-screenBorderY)/screenHeight) * worldHeight);

		return worldSpace;
	}

	drawPose(pose)
	{
		let trianglePoints = new Array(pose.trianglePoints.length);
		let velocityPoints = new Array(pose.velocityPoints.length);
		let triangleBrightness = DEFAULT_BRIGHTNESS;
		let velocityBrightness = DEFAULT_BRIGHTNESS;

		if(TRIANGLE_SELECTED == pose.rolloverState)
		{
			triangleBrightness = ROLLOVER_BRIGHTNESS;
		}
		else if(VELOCITY_SELECTED == pose.rolloverState)
		{
			velocityBrightness = ROLLOVER_BRIGHTNESS;
		}

		for(let i = 0; i < pose.trianglePoints.length; i++)
		{
			trianglePoints[i] = this.worldSpaceToScreenSpace(pose.trianglePoints[i]);
		}

		for(let i = 0; i < pose.velocityPoints.length; i++)
		{
			velocityPoints[i] = this.worldSpaceToScreenSpace(pose.velocityPoints[i]);
		}

		//Draw triangle
		push();
		strokeWeight(1);
		fill(0,0,200, triangleBrightness);
		triangle(trianglePoints[0][0], trianglePoints[0][1], 
						 trianglePoints[1][0], trianglePoints[1][1],
						 trianglePoints[2][0], trianglePoints[2][1]);
		pop();

		//Draw velocity vector
		push();
		strokeWeight(1);
		fill(0,200,0, velocityBrightness);
		beginShape();
		     vertex(velocityPoints[0][0], velocityPoints[0][1]); 
				 vertex(velocityPoints[1][0], velocityPoints[1][1]);
				 vertex(velocityPoints[2][0], velocityPoints[2][1]);
				 vertex(velocityPoints[3][0], velocityPoints[3][1]);
				 vertex(velocityPoints[0][0], velocityPoints[0][1]);
		endShape();
		pop();
	}

	updatePoses(x, y)
	{
		let worldSpaceMouse = this.screenSpaceToWorldSpace([mouseX, mouseY]);
		this.poses.forEach(function(pose)
		{
			pose.updatePose(worldSpaceMouse[0], worldSpaceMouse[1]);
		});
	}

	selectPose(x, y)
	{
		let poseNotSelected = true;

		//Alert each pose about possible selection
		this.poses.forEach(function(pose)
		{
			//If the rollover state is not NOT_SELECTED, the pose will mark itself as selected
			if(pose.select())
			{
				//A pose has been selected
				poseNotSelected = false;
			}
		});

		if(poseNotSelected)
		{
			//No pose selected, add a new pose to the end of the list
			let worldMouse = this.screenSpaceToWorldSpace([x,y]);
			let tempPose = new Pose(worldMouse[0], worldMouse[1], 0, 1);
			this.poses.push(tempPose);
		}
	}

	deselectPose()
	{
		this.poses.forEach(function(pose)
		{
			pose.deselect();
		});
	}

	draw()
	{
		let worldSpaceMouse = this.screenSpaceToWorldSpace([mouseX, mouseY]);
		//Always draw
		this.poses.forEach(function(pose)
		{
			pose.rollover(worldSpaceMouse[0], worldSpaceMouse[1]);
			pose.updatePose(worldSpaceMouse[0], worldSpaceMouse[1]);
			smoothControl.drawPose(pose);
		});
	}
}
