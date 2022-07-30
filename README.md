# lens-studio-pitfalls
#2 `сonst` is actually `var`

In Lens Studio scripts, `const` variables can be easily mutated, that is, this works without errors:
 `
const a = 10; 
a = 5;
`
It seems that `const` is implemented as a simple syntax highlight that works in the same way as `var`. You can still use `const` to signify that you won’t mutate a variable, but remember about some tricky behavior of var - it will apply to `const` in Lens Studio too.



#4 Tweens with `recursive = true` and destroying objects

Various Tween components can recursively change the property of some object and all its children, and all their children, and all their children… and so on during time - making an animation. For example, `TweenAlpha` with `recursive = true` can smoothly change the opacity of on object tree (for example, whole scene) during 5 seconds

To do that, Tween components recursively walk an object tree, starting animation on each object that has the property that is animated (for example, not all objects have opacity - some of them might be not visible at all). 

While animation is happening, you should not destroy objects inside that object tree, as Tween might try to change a property of an object roughly at the same time as you destroy it. Tring to change a property of the destroyed object will result in error and the whole animation will crash. 

#5 TweenScreenTransform

Some properties have confusing names (nothing says that To moves from origin, I would have thought it moves from initial position)

Type = Position
From/To: From some point To other point
To: From origin (0, 0, 0) To specified point
From: From specified point To origin (0, 0, 0)
Offset: Offset from initial position by specified vector

#5 FaceOccluder overlaps objects that doesn’t seem not to overlap it

If your object does not seem to overlap the blue face on the scene (FaceOccluder), but in preview the face does overlap it, check the object’s parent coordinates. You can have the following situation:

FaceOccluder(0, 0, 0)
Parent (0, 0, 0)
   Child (0, 0, 10)

That is, Child has z = 10 and FaceOccluder has z = 0 so it looks like they don’t overlap. However, Parent has z = 0 and does overlap FaceOccluder, and, as Child is a child of Parent, Lens Studio considers Child to also overlap FaceOccluder

