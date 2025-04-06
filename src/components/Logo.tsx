const SVGComponent = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" {...props}>
    <defs>
      <linearGradient id="primary-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6C5CE7" />
        <stop offset="100%" stopColor="#4834D4" />
      </linearGradient>
      <linearGradient id="accent-gradient" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#00DBDE" />
        <stop offset="100%" stopColor="#00A1FF" />
      </linearGradient>
      <filter id="inner-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation={6} result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation={5} result="blur" />
        <feFlood floodColor="#6C5CE7" floodOpacity={0.5} result="color" />
        <feComposite in="color" in2="blur" operator="in" result="glow" />
        <feComposite in="glow" in2="SourceGraphic" operator="over" />
      </filter>
    </defs>
    <rect
      x={50}
      y={50}
      width={200}
      height={200}
      rx={30}
      ry={30}
      fill="url(#primary-gradient)"
      filter="url(#glow)"
    />
    <path
      d="M90,110 L210,110 M90,150 L210,150 M90,190 L160,190"
      stroke="#FFFFFF"
      strokeWidth={4}
      strokeLinecap="round"
      opacity={0.7}
    />
    <circle cx={200} cy={190} r={15} fill="url(#accent-gradient)" />
    <path
      d="M70,70 L80,70 L80,80 L70,80 Z M95,70 L105,70 L105,80 L95,80 Z M120,70 L130,70 L130,80 L120,80 Z"
      fill="#FFFFFF"
      opacity={0.3}
    />
    <g opacity={0.7}>
      <circle cx={80} cy={230} r={1.5} fill="#FFFFFF" />
      <circle cx={220} cy={70} r={1.5} fill="#FFFFFF" />
      <circle cx={60} cy={160} r={1} fill="#FFFFFF" />
      <circle cx={240} cy={190} r={1} fill="#FFFFFF" />
      <circle cx={180} cy={60} r={1} fill="#FFFFFF" />
      <circle cx={70} cy={90} r={1} fill="#FFFFFF" />
    </g>
  </svg>
);
export default SVGComponent;
