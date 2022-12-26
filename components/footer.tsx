import Container from './container'
import { EXAMPLE_PATH } from '../lib/constants'

const Footer = () => {
  return (
    <footer className="bg-neutral-50 border-t border-neutral-200">
      <Container>
        <div className="py-4 flex flex-col items-center">
          <h3 className="text-sm font-light">
            This page is made by me in Seattle
          </h3>
          <div className="text-sm font-light">
            © 2022 Aamir Jawaid
          </div>
        </div>
      </Container>
    </footer>
  )
}

export default Footer
