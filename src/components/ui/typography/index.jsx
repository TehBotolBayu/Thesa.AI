export const HeroTitle = ({ text, className = '' }) => {
  return (
    <h1
    className={`md:text-5xl text-2xl font-semibold 
      text-gray-800 bg-black
      w-fit ${className}
      `}
    >{text}</h1>
  )
};



export const HeroTitle2 = ({ text, className = '' }) => {
  return (
    <h1
    className={`z-40 text-5xl font-semibold 
      bg-linear-to-tr from-light-blue to-dark-blue text-white 
      w-fit ${className}
      `}
    >{text}</h1>
  )
};

export const HeroTitle3 = ({ text, className = '' }) => {
  return (
    <h1
    className={`md:text-3xl text-xl font-semibold 
      bg-linear-to-tr from-light-blue to-dark-blue text-white 
      w-fit ${className}
      `}
    >{text}</h1>
  )
};

export const SubTitleTextBig = ({ text, className = '' }) => {
  return (
    <p className={
      `md:text-3xl text-2xl font-semibold text-black ${className}` 
    }>
      {text}
    </p>
  )
}

export const SubTitleText = ({ text, className = '' }) => {
  return (
    <p className={
      `text-lg font-regular text-black ${className}` 
    }>
      {text}
    </p>
  )
}

export const MediumText = ({ text, className = '' }) => {
  return (
    <p className={
      `text-md font-medium text-black ${className}` 
    }>
      {text}
    </p>
  )
}

export const SmallText = ({ text, className = '' }) => {
  return (
    <p className={
      `text-xs font-medium text-black ${className}` 
    }>
      {text}
    </p>
  )
}