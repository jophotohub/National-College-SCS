import React from 'react';

interface CollegeLogoProps {
  className?: string;
  size?: number;
}

export default function CollegeLogo({ className = '', size = 80 }: CollegeLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={`${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer border double circle */}
      <circle cx="100" cy="100" r="96" fill="white" stroke="#1e293b" strokeWidth="2.5" />
      <circle cx="100" cy="100" r="91" fill="none" stroke="#1e293b" strokeWidth="1" />
      
      {/* Curved Sanskrit Text at Top */}
      <path
        id="sanskrit-path"
        d="M 32,100 A 68,68 0 0,1 168,100"
        fill="none"
        stroke="none"
      />
      <text className="font-sans font-bold" fill="#1e293b">
        <textPath href="#sanskrit-path" startOffset="50%" textAnchor="middle" fontSize="13px">
          सा विद्या या विमुक्तये
        </textPath>
      </text>

      {/* Inner graphic boundaries */}
      <circle cx="100" cy="100" r="66" fill="none" stroke="#1e293b" strokeWidth="1.5" />
      
      {/* Drawing the Rising Sun (right side) */}
      <g>
        {/* Sun rays */}
        <line x1="145" y1="100" x2="180" y2="100" stroke="#1e293b" strokeWidth="1.5" />
        <line x1="139" y1="88" x2="169" y2="73" stroke="#1e293b" strokeWidth="1.5" />
        <line x1="131" y1="78" x2="152" y2="53" stroke="#1e293b" strokeWidth="1.5" />
        <line x1="120" y1="72" x2="131" y2="40" stroke="#1e293b" strokeWidth="1.5" />
        <line x1="108" y1="69" x2="108" y2="35" stroke="#1e293b" strokeWidth="1.5" />
        <line x1="96" y1="70" x2="85" y2="36" stroke="#1e293b" strokeWidth="1.5" />
        <line x1="85" y1="74" x2="64" y2="45" stroke="#1e293b" strokeWidth="1.5" />
        
        {/* Sun body */}
        <path d="M 108,100 A 37,37 0 0,1 145,100" fill="none" stroke="#1e293b" strokeWidth="2" />
        <circle cx="126" cy="100" r="14" fill="#1e293b" />
      </g>

      {/* Water & Waves (lower left/middle) */}
      <g>
        {/* Horizontal dividing water line */}
        <line x1="35" y1="100" x2="165" y2="100" stroke="#1e293b" strokeWidth="2" />
        
        {/* Wave ripples */}
        <path d="M 40,106 Q 50,103 60,106 T 80,106 T 100,106" fill="none" stroke="#1e293b" strokeWidth="1" />
        <path d="M 45,112 Q 58,109 71,112 T 97,112 T 123,112" fill="none" stroke="#1e293b" strokeWidth="1" />
        <path d="M 50,118 Q 65,115 80,118 T 110,118" fill="none" stroke="#1e293b" strokeWidth="1" />
      </g>

      {/* Reeds / Plants on far left */}
      <g stroke="#1e293b" strokeWidth="1.5" fill="none">
        <path d="M 38,100 C 35,80 34,70 34,65" />
        <path d="M 42,100 C 40,82 41,72 43,68" />
        <path d="M 46,100 C 46,85 49,78 51,74" />
        {/* Leaves */}
        <path d="M 34,80 Q 30,75 34,70" fill="#1e293b" />
        <path d="M 41,85 Q 37,80 41,75" fill="#1e293b" />
        <path d="M 43,78 Q 47,73 43,68" fill="#1e293b" />
      </g>

      {/* Lotus Flower in Water (lower left) */}
      <g transform="translate(62, 100)" stroke="#1e293b" strokeWidth="1.2" fill="white">
        {/* Center Petal */}
        <path d="M 15,-1 Q 15,-18 0,-18 Q -15,-18 -15,-1 Q -10,8 0,8 Q 10,8 15,-1 Z" />
        {/* Left Side Petals */}
        <path d="M -5,-1 Q -22,-13 -27,-2 Q -22,6 -5,-1" />
        <path d="M -8,2 Q -26,0 -24,8 Q -12,10 -8,2" />
        {/* Right Side Petals */}
        <path d="M 5,-1 Q 22,-13 27,-2 Q 22,6 5,-1" />
        <path d="M 8,2 Q 26,0 24,8 Q 12,10 8,2" />
        {/* Lotus base/pad leaf */}
        <path d="M -22,8 Q 0,16 22,8" fill="none" strokeWidth="1.5" />
      </g>

      {/* College Name inside the bottom-half of the inner circle */}
      <g textAnchor="middle" fill="#1e293b" className="font-sans font-black">
        <text x="100" y="146" fontSize="11px" letterSpacing="0.4">NATIONAL COLLEGE</text>
      </g>

      {/* Trichinopoly Curved Text at bottom along lower circle path */}
      <path
        id="trichy-path"
        d="M 38,125 A 64,64 0 0,0 162,125"
        fill="none"
        stroke="none"
      />
      <text className="font-sans font-bold" fill="#1e293b">
        <textPath href="#trichy-path" startOffset="50%" textAnchor="middle" fontSize="10px" letterSpacing="0.6">
          TRICHINOPOLY
        </textPath>
      </text>
    </svg>
  );
}
