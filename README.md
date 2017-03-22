# pid-demo

Demo page and write up explaining PID control. In development.

## `pid.js` library

The library consists of two parts: system and control. Control accepts a set of options like PID mode, PID settings, ramp and autotune settings and a system object that it will operate. To get current value, controller will call `system.getValue()` function and try to get it's value to the setpoint by calling another function: `system.apply(output)`

This function should return time that passed in the system during this call. It will allow controler to calculate derivative and integral for the next step.

Now the funny part: system could be anything - it can be a simulation of a heating box, driving car, balancing robot or even a flying unicorn model. But it also can be a real device that you control within this system class via http, websockets or serial port communication. It should work the same - controller class requires only `apply` and `getValue` functions, nothing more.

## Writeup

- Ideal PID controller
	- Basics of PID control: what P, I and D do and what happens if they are wrong or missing
	- Autotuning algorithms. Step responce, Relay method.
	- Ramping. How to ramp smart.
- Real PID controller
	- Working with limitations in output
	- Noisy measurements: filtering the data (Kalman filter)
	- Autotuning with noize

## Talk

The [talk](talk) folder contains my slides from Ringberg group retreat.