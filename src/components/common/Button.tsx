import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '@/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'onDark' | 'onDarkOutline' | 'quiet';
export type ButtonSize = 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-200 disabled:pointer-events-none disabled:opacity-55 active:translate-y-px whitespace-nowrap';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-electric-600 text-white shadow-[0_1px_0_rgb(255_255_255/0.2)_inset] hover:bg-electric-700',
  secondary: 'border border-rule-strong bg-white text-navy-950 hover:border-navy-800 hover:bg-mist',
  onDark: 'bg-white text-navy-950 hover:bg-signal',
  onDarkOutline: 'border border-white/30 text-white hover:border-white/70 hover:bg-white/8',
  quiet: 'text-electric-700 hover:text-navy-950 hover:bg-electric-50 px-2.5',
};

const sizes: Record<ButtonSize, string> = {
  md: 'h-10 px-4 text-[0.9375rem]',
  lg: 'h-12 px-5 text-base',
};

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string): string {
  return cn(base, variants[variant], variant === 'quiet' ? 'h-9 text-[0.9375rem]' : sizes[size], className);
}

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: 'start' | 'end';
  children: ReactNode;
}

function Content({ icon, iconPosition = 'end', children }: Pick<CommonProps, 'icon' | 'iconPosition' | 'children'>) {
  return (
    <>
      {icon && iconPosition === 'start' ? icon : null}
      <span>{children}</span>
      {icon && iconPosition === 'end' ? icon : null}
    </>
  );
}

type ButtonProps = CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

export function Button({ variant, size, icon, iconPosition, className, children, type = 'button', ...rest }: ButtonProps) {
  return (
    <button type={type} className={buttonClasses(variant, size, className)} {...rest}>
      <Content icon={icon} iconPosition={iconPosition}>
        {children}
      </Content>
    </button>
  );
}

type ButtonLinkProps = CommonProps & Omit<LinkProps, 'children'>;

/** Enlace interno con apariencia de botón. */
export function ButtonLink({ variant, size, icon, iconPosition, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...rest}>
      <Content icon={icon} iconPosition={iconPosition}>
        {children}
      </Content>
    </Link>
  );
}

type ButtonAnchorProps = CommonProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'>;

/** Enlace externo o mailto con apariencia de botón. */
export function ButtonAnchor({ variant, size, icon, iconPosition, className, children, ...rest }: ButtonAnchorProps) {
  return (
    <a className={buttonClasses(variant, size, className)} {...rest}>
      <Content icon={icon} iconPosition={iconPosition}>
        {children}
      </Content>
    </a>
  );
}
