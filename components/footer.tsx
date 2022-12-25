import Container from './container'
import { EXAMPLE_PATH } from '../lib/constants'

const Footer = () => {
  return (
    <footer className="bg-neutral-50 border-t border-neutral-200">
      <Container>
        <div className="py-4 flex flex-col items-center">
          <h3 className="text-normal font-medium">
            Muslim · Engineer · Seattle
          </h3>
        </div>
      </Container>
    </footer>
  )
}

export default Footer
