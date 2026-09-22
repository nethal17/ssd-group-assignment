const Card = ({ className = "", ...props }) => {
    return <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`} {...props} />
  }
  
  const CardContent = ({ className = "", ...props }) => {
    return <div className={`p-6 pt-0 ${className}`} {...props} />
  }
  
  export { Card, CardContent }
  