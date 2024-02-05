import pandas as pd
import numpy as np
from math import *
from tkinter import *
from collections import *

#Read data
data1 = pd.read_csv("data1.csv",names=['x','y','category'])
data2 = pd.read_csv("data2.csv",names=['x','y','category'])
dataset = data1

#Get max and min value
max_value = dataset.max()
min_value = dataset.min()

#CSV to array
data = dataset.to_numpy()
#print(data) #look at array

#Create a window
window=Tk()

#Set the size of the window 
scale = 5 
winX = scale * floor((max_value[0]+abs(max_value[0])))
winY = scale * floor((max_value[1]+abs(max_value[1])))
window.geometry(str(winX) + "x" + str(winY))

#Create a canvas 
canvas = Canvas(window, width=winX, height=winY)
canvas.pack(fill="both", expand=True)

#Extend the axes
extention = 20

# Add axis lines on the canvas
# Offset center 
originX = winX / 2  
originY = winY / 2
yAxis = -scale*(max_value[0]+extention)+originX, originY, scale*(max_value[0]+extention)+originX, originY # points of y-axis
xAxis = originX, -scale*(max_value[1]+extention)+originY, originX,scale*(max_value[1]+extention)+originY # points of x-axis

canvas.create_line(xAxis, fill = "black", width=1) # create x-axis
canvas.create_line(yAxis, fill = "black", width=1) # create y-axis

#Tick marks and value for x
for i in range(-floor(max_value[0]+extention), floor(max_value[0]+extention)):
    if i == 0:
        continue
    if(i%10 == 0): # ticks in intervals of 10
        canvas.create_line(scale*i+originX, originY-3, scale*i+originX, originY+3, fill = "black", width=1)
        canvas.create_text(scale*i+originX, originY+15, text=str(i))

#Tick marks and value for y
for i in range(-floor(max_value[1]+extention), floor(max_value[1]+extention)):
    if i == 0:
        continue
    if(i%10 == 0):
        canvas.create_line(originX-3, scale*i+originY, originX+3, scale*i+originY, fill = "black", width=1)
        canvas.create_text(originX-15, scale*i+originY, text=str(-i)) #-i to get the text in axis correct (inte helt hundra varför, testning)


is_clicked = TRUE
def left_click(event):
    global is_clicked, tempx, tempy, circle, object

    #Id and index from choosen data
    object_id = event.widget.find_withtag('current')[0]
    tag = event.widget.gettags(object_id)[0]
    index = int(tag[5:])

    #Get x and y cordinates for the choosen data
    x = data[int(index)][0]
    y = data[int(index)][1]

   
    if is_clicked:
        #Moving the canvas
        canvas.move("move", -scale*x, scale*y) 
        circle = canvas.create_oval(originX-10, originY+10, originX+10, originY-10, fill=None, outline='red') #Create circle

        #Change color in each quadrant 
        for i in range(len(data)):
            x1 = data[int(i)][0]
            y1 = data[int(i)][1]
            if x1 < x and y1 > y:
                canvas.itemconfig(object[i], fill='red')
            elif x1 > x and y1 > y:
                canvas.itemconfig(object[i], fill='green')
            elif x1 < x and y1 < y:
                canvas.itemconfig(object[i], fill='yellow')
            elif x1 > x and y1 < y:
                canvas.itemconfig(object[i], fill='magenta')

        is_clicked = FALSE
        tempx, tempy = x, y
    else: #Go back to original canvas
        canvas.move("move", scale*tempx, -scale*tempy)
        canvas.delete(circle)
        for i in range(len(data)):
            canvas.itemconfig(object[i], fill='blue')
        is_clicked = TRUE


is_on = False
def right_click(event):
    global is_on

    #Id and index from choosen data
    object_id = event.widget.find_withtag('current')[0]
    tag = event.widget.gettags(object_id)[0]
    index = int(tag[5:])

    #Get x and y cordinates for the choosen data
    x = data[int(index)][0]
    y = data[int(index)][1]

    #Find euclidian value from choosen point
    dist = []
    for i in range(len(data)):
        dist.append(sqrt(pow((x-data[i][0]),2)+pow((y-data[i][1]),2))) #add distance to dist

    #Sort dist by distance and only show the choosen object and the closest 5
    closest_values = sorted(range(len(dist)), key=lambda nearest: dist[nearest])[0:6]

    #Highlight the clicked point and 5 closest points
    if not is_on:
        circle_size = 10
        for i in closest_values:
            x_pos = (data[i][0]) * scale
            y_pos = (data[i][1]) * scale
            if i == int(index): #highligth choosen obj
                canvas.create_oval(x_pos + originX - circle_size, -y_pos + originY + circle_size, 
                                   x_pos + originX + circle_size, -y_pos + originY - circle_size, fill=None, outline='blue', tags="highlight")
            else: # highligth nearest obj
                canvas.create_oval(x_pos + originX - circle_size, -y_pos + originY + circle_size, 
                                   x_pos + originX + circle_size, -y_pos + originY - circle_size, fill=None, outline='red', tags="highlight")
        is_on = True

    else: #Remove highligths 
        canvas.delete("highlight")
        is_on = False


#Print data 
i = 0
category_amount = np.sort(list(Counter(dataset['category']).values())) # Count how many of each type
category_type = np.sort(list(set(dataset['category']))) # Gets the category types, sorted
size = 3 # Size of the points in the plot
object = {}

for i in range(len(data)):
    x_pos = (data[i][0]) * scale
    y_pos = (data[i][1]) * scale

    # Prints the first category as circles
    if data[i][2] == category_type[0]:
        object[i] = canvas.create_oval(x_pos + originX - size, -y_pos + originY + size, x_pos + originX + size,
                                       -y_pos + originY - size, fill='blue', tags=(("shape" + str(i)), "move"))

    # Prints the first category as squares
    if data[i][2] == category_type[1]:
        object[i] = canvas.create_rectangle(x_pos + originX - size, -y_pos + originY + size, x_pos + originX + size,
                                            -y_pos + originY - size, fill='blue', tags=(("shape" + str(i)), "move"))

    # Prints the first category as triangles
    if data[i][2] == category_type[2]:
        object[i] = canvas.create_polygon(x_pos + originX - size, -y_pos + originY - size,
                                          x_pos + originX + size, -y_pos + originY - size, x_pos + originX,
                                          -y_pos + originY + size, fill='blue', tags=(("shape" + str(i)), "move"),
                                          outline='black')

    canvas.tag_bind(("shape" + str(i)), "<Button-1>", left_click)  # left click interaction
    canvas.tag_bind(("shape" + str(i)), "<Button-3>", right_click)  # right click interaction

for i in range(len(category_type)):
    shape = ['circle', 'square', 'triangle']
    leg = Label(window, text=str(shape[i]) + " : " + str(category_type[i]) + ', ' + str(category_amount[i])).place(
        relx=0.95, rely=0.1 + 0.05 * i, anchor="ne")


window.mainloop()