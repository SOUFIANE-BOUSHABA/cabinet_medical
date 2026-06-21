import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '@/App'
import { AppProviders } from '@/app/providers'

describe('App', () => {
  it('renders the staff login screen', () => {
    render(
      <MemoryRouter initialEntries={['/staff/login']}>
        <AppProviders>
          <App />
        </AppProviders>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'Portail Praticien' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Email Professionnel')).toBeInTheDocument()
  })

  it('renders the patient login screen', () => {
    render(
      <MemoryRouter initialEntries={['/patient/login']}>
        <AppProviders>
          <App />
        </AppProviders>
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'Bienvenue' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('NUMÉRO DE CIN')).toBeInTheDocument()
    expect(screen.getByLabelText('MOT DE PASSE')).toBeInTheDocument()
  })
})
