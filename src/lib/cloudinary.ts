import { CLOUDINARY_CLOUD_NAME } from "@/constants";
import { Cloudinary } from "@cloudinary/url-gen";
import { dpr, format, quality } from "@cloudinary/url-gen/actions/delivery";
import { source } from "@cloudinary/url-gen/actions/overlay";
import { fill } from "@cloudinary/url-gen/actions/resize";
import { compass } from "@cloudinary/url-gen/qualifiers/gravity";
import { Position } from "@cloudinary/url-gen/qualifiers/position";
import { text } from "@cloudinary/url-gen/qualifiers/source";
import { TextStyle } from "@cloudinary/url-gen/qualifiers/textStyle";


const cld = new Cloudinary({ cloud: { cloudName: CLOUDINARY_CLOUD_NAME } });
export const bannerPhoto = (imageCldPubId: string, name: string) => {
    return cld
        .image(imageCldPubId)
        .resize(fill())
        .delivery(format('auto'))
        .delivery(quality('auto'))
        .delivery(dpr('auto')) //device pixel ratio
        .overlay(
            source(
                text(name, new TextStyle('roboto', 100).fontWeight('bold'))
                    .textColor(
                        'white'
                    )
            ).position(
                new Position()
                    .gravity(compass('west'))
                    // .offsetY(0.2)
                    .offsetX(0.02)
            )
        );

}