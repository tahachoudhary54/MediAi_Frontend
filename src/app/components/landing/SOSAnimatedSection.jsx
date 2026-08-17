
import { useState, useEffect } from 'react';
export function SOSAnimatedSection({ render }) {
  const [sosStep, setSosStep] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setSosStep((prev) => (prev + 1) % 4)
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return render(sosStep);
}
