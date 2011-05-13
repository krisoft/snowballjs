(clear)
(define stars (build-particles 1000))
(with-primitive stars
    (texture (load-texture "splat.png"))
    (pdata-map! (lambda (p) (vmul (hsrndvec) 30)) "p")
    (pdata-map! (lambda (s) (* .5 (rndf))) "s")
    (pdata-map! (lambda (c) (vector 1 1 1)) "c"))
(define fold (build-sphere 15 15))
(with-primitive fold
    (scale 2)
    (texture (load-texture "earth.png")))
(define hold (build-sphere 15 15))
(with-primitive hold
    (scale 1.2)
    (translate (vector 6 0 0))
    (texture (load-texture "moon.png")))


(reset-camera)
(define cam (get-camera-transform))
(define forgat (vector 0 0 0))
(every-frame (begin
    (set-camera-transform (mmul cam (mrotate forgat)))
    (when (osc-msg "/forgat")
        (set! forgat (vmul (vadd (vmul forgat 19) 
                                 (vmul (vector (osc 0) (osc 2) (osc 1)) 1)) 1/20))
    )))
(osc-source "5678")
(osc-destination "osc.udp://localhost:5670")
(osc-send "/webOSC/join" "si" (list "/forgat" 5678))
(osc-send "/valami" "s" (list "hej!"))